// src/modules/shipments/shipment.service.ts
import { ShipmentRepository } from './shipment.repository';
import { CreateShipmentDto, UpdateShipmentDto } from './shipment.types';

export class ShipmentService {
  private repo = new ShipmentRepository();
  async findByOrder(orderId: string) { return this.repo.findByOrder(orderId); }
  async findById(id: string) { return this.repo.findById(id); }
  async create(dto: CreateShipmentDto) { return this.repo.create(dto); }
  async update(id: string, dto: UpdateShipmentDto) { return this.repo.update(id, dto); }
}