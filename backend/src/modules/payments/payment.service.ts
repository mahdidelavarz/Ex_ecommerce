// src/modules/payments/payment.service.ts
import { PaymentRepository } from './payment.repository';
import { CreatePaymentDto, UpdatePaymentDto } from './payment.types';

export class PaymentService {
  private repo = new PaymentRepository();

  async findByOrder(orderId: string) {
    return this.repo.findByOrder(orderId);
  }

  async findById(id: string) {
    return this.repo.findById(id);
  }

  async create(dto: CreatePaymentDto) {
    return this.repo.create(dto);
  }

  async update(id: string, dto: UpdatePaymentDto) {
    return this.repo.update(id, dto);
  }
}