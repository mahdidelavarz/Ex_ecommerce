// src/modules/shipments/shipment.service.ts
import { ShipmentRepository } from './shipment.repository';
import { CreateShipmentDto, UpdateShipmentDto } from './shipment.types';

export class ShipmentService {
  private repo = new ShipmentRepository();

  async findByOrder(orderId: string, userId?: string) {
    return this.repo.findByOrder(orderId, userId);
  }

  async findById(id: string, userId?: string) {
    return this.repo.findById(id, userId);
  }

  async create(dto: CreateShipmentDto) {
    return this.repo.create(dto);
  }

  async update(id: string, dto: UpdateShipmentDto) {
    return this.repo.update(id, dto);
  }
}
