// src/modules/payments/payment.repository.ts
import { AppDataSource } from '../../config/database';
import { Payment } from '../../database/entities/payment.entity';
import { Order } from '../../database/entities/order.entity';
import { NotFoundError } from '../../shared/utils/errors';
import { CreatePaymentDto, UpdatePaymentDto } from './payment.types';

export class PaymentRepository {
  private repo = AppDataSource.getRepository(Payment);
  private orderRepo = AppDataSource.getRepository(Order);

  async findByOrder(orderId: string) {
    return this.repo.find({ where: { order_id: orderId }, order: { created_at: 'DESC' } });
  }

  async findById(id: string) {
    const payment = await this.repo.findOne({ where: { id } });
    if (!payment) throw new NotFoundError('پرداخت یافت نشد');
    return payment;
  }

  async create(dto: CreatePaymentDto) {
    const order = await this.orderRepo.findOne({ where: { id: dto.order_id } });
    if (!order) throw new NotFoundError('سفارش یافت نشد');

    const payment = this.repo.create({
      order_id: dto.order_id,
      provider: dto.provider,
      method: dto.method,
      amount: dto.amount,
      currency_code: order.currency_code || 'IRR',
      status: 'pending',
    });

    const saved = await this.repo.save(payment);

    // Update order payment status
    order.payment_status = 'pending';
    await this.orderRepo.save(order);

    return saved;
  }

  async update(id: string, dto: UpdatePaymentDto) {
    const payment = await this.repo.findOne({ where: { id } });
    if (!payment) throw new NotFoundError('پرداخت یافت نشد');

    if (dto.status) payment.status = dto.status as any;
    if (dto.transaction_id !== undefined) payment.transaction_id = dto.transaction_id;
    if (dto.gateway_response !== undefined) payment.gateway_response = dto.gateway_response;
    if (dto.paid_at) payment.paid_at = new Date(dto.paid_at);
    if (dto.refund_amount !== undefined) payment.refund_amount = dto.refund_amount;

    const saved = await this.repo.save(payment);

    // Sync order payment status
    if (dto.status) {
      const order = await this.orderRepo.findOne({ where: { id: payment.order_id } });
      if (order) {
        if (dto.status === 'completed') {
          order.payment_status = 'paid';
          order.paid_amount = payment.amount;
          order.due_amount = Math.max(0, order.total_amount - payment.amount);
        } else if (dto.status === 'failed') {
          order.payment_status = 'failed';
        } else if (dto.status === 'refunded') {
          order.payment_status = 'refunded';
        }
        await this.orderRepo.save(order);
      }
    }

    return saved;
  }
}