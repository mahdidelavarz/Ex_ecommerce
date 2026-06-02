// src/modules/shipments/shipment.repository.ts
import { AppDataSource } from "../../config/database";
import { Shipment } from "../../database/entities/shipment.entity";
import { Order } from "../../database/entities/order.entity";
import { NotFoundError, ConflictError } from "../../shared/utils/errors";
import { CreateShipmentDto, UpdateShipmentDto } from "./shipment.types";

export class ShipmentRepository {
  private repo = AppDataSource.getRepository(Shipment);
  private orderRepo = AppDataSource.getRepository(Order);

  async findByOrder(orderId: string) {
    return this.repo.find({
      where: { order_id: orderId },
      order: { created_at: "DESC" },
    });
  }

  async findById(id: string) {
    const shipment = await this.repo.findOne({ where: { id } });
    if (!shipment) throw new NotFoundError("ارسال یافت نشد");
    return shipment;
  }

  async create(dto: CreateShipmentDto) {
    const order = await this.orderRepo.findOne({ where: { id: dto.order_id } });
    if (!order) throw new NotFoundError("سفارش یافت نشد");

    const existing = await this.repo.findOne({
      where: { tracking_number: dto.tracking_number },
    });
    if (existing) throw new ConflictError("کد پیگیری تکراری است");

    const result = await this.repo.insert({
      order_id: dto.order_id,
      tracking_number: dto.tracking_number,
      courier_name: dto.courier_name,
      tracking_url: dto.tracking_url || null,
      status: "pending" as any,
      estimated_delivery_at: dto.estimated_delivery_at
        ? new Date(dto.estimated_delivery_at)
        : null,
      notes: dto.notes || null,
    } as any);

    await this.orderRepo.update(dto.order_id, {
      fulfillment_status: "partially_fulfilled" as any,
    });

    return this.repo.findOne({
      where: { id: result.identifiers[0].id },
    }) as any;
  }

  async update(id: string, dto: UpdateShipmentDto) {
    const shipment = await this.repo.findOne({ where: { id } });
    if (!shipment) throw new NotFoundError("ارسال یافت نشد");

    const updateData: any = {};
    if (dto.status) updateData.status = dto.status;
    if (dto.tracking_url !== undefined)
      updateData.tracking_url = dto.tracking_url;
    if (dto.shipped_at) updateData.shipped_at = new Date(dto.shipped_at);
    if (dto.delivered_at) updateData.delivered_at = new Date(dto.delivered_at);
    if (dto.notes !== undefined) updateData.notes = dto.notes;

    await this.repo.update(id, updateData);

    if (dto.status) {
      const orderUpdate: any = {};
      if (dto.status === "shipped" || dto.status === "in_transit") {
        orderUpdate.order_status = "shipped";
        orderUpdate.fulfillment_status = "fulfilled";
      } else if (dto.status === "delivered") {
        orderUpdate.order_status = "delivered";
      }
      if (Object.keys(orderUpdate).length > 0) {
        await this.orderRepo.update(shipment.order_id, orderUpdate);
      }
    }

    return this.repo.findOne({ where: { id } }) as any;
  }
}
