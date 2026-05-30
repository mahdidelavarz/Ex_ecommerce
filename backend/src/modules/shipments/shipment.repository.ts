// src/modules/shipments/shipment.repository.ts
import { AppDataSource } from '../../config/database';
import { Shipment } from '../../database/entities/shipment.entity';
import { Order } from '../../database/entities/order.entity';
import { NotFoundError, ConflictError } from '../../shared/utils/errors';
import { CreateShipmentDto, UpdateShipmentDto } from './shipment.types';

export class ShipmentRepository {
  private repo = AppDataSource.getRepository(Shipment);
  private orderRepo = AppDataSource.getRepository(Order);

  async findByOrder(orderId: string) {
    return this.repo.find({ where: { order_id: orderId }, order: { created_at: 'DESC' } });
  }

  async findById(id: string) {
    const shipment = await this.repo.findOne({ where: { id } });
    if (!shipment) throw new NotFoundError('ارسال یافت نشد');
    return shipment;
  }

  async create(dto: CreateShipmentDto) {
    const order = await this.orderRepo.findOne({ where: { id: dto.order_id } });
    if (!order) throw new NotFoundError('سفارش یافت نشد');

    // Check tracking number unique
    const existing = await this.repo.findOne({ where: { tracking_number: dto.tracking_number } });
    if (existing) throw new ConflictError('کد پیگیری تکراری است');

    const shipment = this.repo.create({
      order_id: dto.order_id,
      tracking_number: dto.tracking_number,
      courier_name: dto.courier_name,
      tracking_url: dto.tracking_url || null,
      status: 'pending',
      estimated_delivery_at: dto.estimated_delivery_at ? new Date(dto.estimated_delivery_at) : null,
      notes: dto.notes || null,
    });

    const saved = await this.repo.save(shipment);

    // Update order fulfillment
    order.fulfillment_status = 'partially_fulfilled';
    await this.orderRepo.save(order);

    return saved;
  }

  async update(id: string, dto: UpdateShipmentDto) {
    const shipment = await this.repo.findOne({ where: { id } });
    if (!shipment) throw new NotFoundError('ارسال یافت نشد');

    if (dto.status) shipment.status = dto.status as any;
    if (dto.tracking_url !== undefined) shipment.tracking_url = dto.tracking_url;
    if (dto.shipped_at) shipment.shipped_at = new Date(dto.shipped_at);
    if (dto.delivered_at) shipment.delivered_at = new Date(dto.delivered_at);
    if (dto.notes !== undefined) shipment.notes = dto.notes;

    const saved = await this.repo.save(shipment);

    // Sync order
    const order = await this.orderRepo.findOne({ where: { id: shipment.order_id } });
    if (order) {
      if (dto.status === 'shipped' || dto.status === 'in_transit') {
        order.order_status = 'shipped';
        order.fulfillment_status = 'fulfilled';
      } else if (dto.status === 'delivered') {
        order.order_status = 'delivered';
      }
      await this.orderRepo.save(order);
    }

    return saved;
  }
}