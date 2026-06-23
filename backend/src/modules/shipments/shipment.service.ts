// src/modules/shipments/shipment.service.ts
import { ShipmentRepository } from './shipment.repository';
import { CreateShipmentDto, UpdateShipmentDto } from './shipment.types';
import { ShipmentStatus } from '../../database/entities/shipment.entity';

export class ShipmentService {
  private repo = new ShipmentRepository();

  async list(options: { status?: ShipmentStatus; search?: string; page?: number; limit?: number }) {
    const page = options.page || 1;
    const limit = Math.min(options.limit || 20, 100);
    return this.repo.listAll({ status: options.status, search: options.search, page, limit });
  }

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
