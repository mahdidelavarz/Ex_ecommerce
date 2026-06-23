// src/modules/shipments/shipment.repository.ts
import { AppDataSource } from '../../config/database';
import { Shipment, ShipmentStatus } from '../../database/entities/shipment.entity';
import { Order, FulfillmentStatus, OrderStatus } from '../../database/entities/order.entity';
import { NotFoundError, ConflictError, ForbiddenError } from '../../shared/utils/errors';
import { CreateShipmentDto, UpdateShipmentDto } from './shipment.types';

// Maps shipment terminal statuses to the corresponding order status
const SHIPMENT_TO_ORDER_STATUS: Partial<Record<ShipmentStatus, OrderStatus>> = {
  [ShipmentStatus.SHIPPED]:   OrderStatus.SHIPPED,
  [ShipmentStatus.DELIVERED]: OrderStatus.DELIVERED,
  [ShipmentStatus.RETURNED]:  OrderStatus.RETURNED,
  // in_transit / out_for_delivery / processing / failed → no automatic order status change
};

export class ShipmentRepository {
  private repo      = AppDataSource.getRepository(Shipment);
  private orderRepo = AppDataSource.getRepository(Order);

  // Admin: list all shipments with order context, status filter, search & pagination
  async listAll(options: {
    status?: ShipmentStatus;
    search?: string;
    page: number;
    limit: number;
  }) {
    const qb = this.repo
      .createQueryBuilder('shipment')
      .leftJoin(Order, 'order', 'order.id = shipment.order_id')
      .addSelect('order.order_number', 'order_number')
      .addSelect('order.shipping_address_snapshot', 'shipping_address_snapshot');

    if (options.status) {
      qb.andWhere('shipment.status = :status', { status: options.status });
    }

    if (options.search) {
      qb.andWhere(
        '(shipment.tracking_number ILIKE :s OR order.order_number ILIKE :s)',
        { s: `%${options.search}%` }
      );
    }

    qb.orderBy('shipment.created_at', 'DESC')
      .offset((options.page - 1) * options.limit)
      .limit(options.limit);

    const [{ entities, raw }, total] = await Promise.all([
      qb.getRawAndEntities(),
      qb.getCount(),
    ]);

    const data = entities.map((shipment, i) => ({
      ...shipment,
      order_number: raw[i]?.order_number ?? null,
      customer_name: raw[i]?.shipping_address_snapshot?.full_name ?? null,
    }));

    return {
      data,
      meta: {
        page: options.page,
        limit: options.limit,
        total,
        totalPages: Math.ceil(total / options.limit),
      },
    };
  }

  // SHP-B1: userId param enables ownership check for non-admin callers
  async findByOrder(orderId: string, userId?: string) {
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) throw new NotFoundError('سفارش یافت نشد');
    if (userId && order.user_id !== userId) throw new ForbiddenError('دسترسی ندارید');
    return this.repo.find({ where: { order_id: orderId }, order: { created_at: 'ASC' } });
  }

  async findById(id: string, userId?: string) {
    const shipment = await this.repo.findOne({ where: { id } });
    if (!shipment) throw new NotFoundError('ارسال یافت نشد');
    if (userId) {
      const order = await this.orderRepo.findOne({ where: { id: shipment.order_id } });
      if (!order || order.user_id !== userId) throw new ForbiddenError('دسترسی ندارید');
    }
    return shipment;
  }

  // SHP-B4: wrapped in a transaction so a failed order-update rolls back the shipment insert
  async create(dto: CreateShipmentDto) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order = await queryRunner.manager.findOne(Order, { where: { id: dto.order_id } });
      if (!order) throw new NotFoundError('سفارش یافت نشد');

      const existing = await queryRunner.manager.findOne(Shipment, {
        where: { tracking_number: dto.tracking_number },
      });
      if (existing) throw new ConflictError('کد پیگیری تکراری است');

      // SHP-B6: use typed enum instead of cast string
      const shipment = queryRunner.manager.create(Shipment, {
        order_id:               dto.order_id,
        tracking_number:        dto.tracking_number,
        courier_name:           dto.courier_name,
        tracking_url:           dto.tracking_url ?? null,
        status:                 ShipmentStatus.PENDING,
        estimated_delivery_at:  dto.estimated_delivery_at ? new Date(dto.estimated_delivery_at) : null,
        notes:                  dto.notes ?? null,
      });

      await queryRunner.manager.save(shipment);

      // SHP-B3: set partially_fulfilled on first shipment; fulfillment is set to FULFILLED on delivery
      await queryRunner.manager.update(Order, dto.order_id, {
        fulfillment_status: FulfillmentStatus.PARTIALLY_FULFILLED,
      });

      await queryRunner.commitTransaction();
      return shipment;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async update(id: string, dto: UpdateShipmentDto) {
    const shipment = await this.repo.findOne({ where: { id } });
    if (!shipment) throw new NotFoundError('ارسال یافت نشد');

    // SHP-B6: build typed update object
    const updateData: Partial<Shipment> = {};
    if (dto.status)                      updateData.status       = dto.status as ShipmentStatus;
    if (dto.tracking_url !== undefined)   updateData.tracking_url = dto.tracking_url;
    if (dto.shipped_at)                   updateData.shipped_at   = new Date(dto.shipped_at);
    if (dto.delivered_at)                 updateData.delivered_at = new Date(dto.delivered_at);
    if (dto.notes !== undefined)          updateData.notes        = dto.notes;

    await this.repo.update(id, updateData);

    // SHP-B2: only map terminal shipment statuses to order status changes
    if (dto.status) {
      const newOrderStatus = SHIPMENT_TO_ORDER_STATUS[dto.status as ShipmentStatus];
      const orderUpdate: Partial<Order> = {};

      if (newOrderStatus) orderUpdate.order_status = newOrderStatus;

      // SHP-B3: mark order as fully fulfilled when the shipment is delivered
      if (dto.status === ShipmentStatus.DELIVERED) {
        orderUpdate.fulfillment_status = FulfillmentStatus.FULFILLED;
      }

      if (Object.keys(orderUpdate).length > 0) {
        await this.orderRepo.update(shipment.order_id, orderUpdate);
      }
    }

    return this.repo.findOne({ where: { id } }) as Promise<Shipment>;
  }
}
