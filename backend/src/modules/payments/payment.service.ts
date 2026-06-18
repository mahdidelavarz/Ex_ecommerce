// src/modules/payments/payment.service.ts
import { AppDataSource } from '../../config/database';
import { Order } from '../../database/entities/order.entity';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../shared/utils/errors';
import { env } from '../../config/env';
import { PaymentRepository } from './payment.repository';
import { CreatePaymentDto, UpdatePaymentDto } from './payment.types';
import { ZarinpalService } from './gateway/zarinpal.service';

export class PaymentService {
  private repo = new PaymentRepository();
  private zarinpal = new ZarinpalService();
  private orderRepo = AppDataSource.getRepository(Order);

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

  async initiate(orderId: string, userId: string) {
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) throw new NotFoundError('سفارش یافت نشد');
    if (order.user_id !== userId) throw new ForbiddenError();
    if (order.payment_status === 'paid' as any) throw new BadRequestError('این سفارش قبلاً پرداخت شده است');

    const callbackUrl = `${env.zarinpal.callbackUrl}?order_id=${orderId}`;
    const authority = await this.zarinpal.requestPayment(
      Number(order.total_amount),
      `پرداخت سفارش ${order.order_number}`,
      callbackUrl,
    );

    await this.repo.create({
      order_id: orderId,
      provider: 'zarinpal',
      method: 'online',
      amount: Number(order.total_amount),
      transaction_id: authority,
    });

    return { gateway_url: this.zarinpal.getGatewayUrl(authority) };
  }

  async verify(authority: string, status: string, orderId: string): Promise<string> {
    if (status !== 'OK') {
      const payment = await this.repo.findByTransactionId(authority);
      if (payment) return `${env.frontendUrl}/orders/${payment.order_id}?payment=cancelled`;
      return `${env.frontendUrl}/orders?payment=cancelled`;
    }

    const payment = await this.repo.findByTransactionId(authority);
    if (!payment) return `${env.frontendUrl}/orders?payment=cancelled`;

    const { refId, alreadyVerified } = await this.zarinpal.verifyPayment(authority, Number(payment.amount));

    if (!alreadyVerified) {
      await this.repo.update(payment.id, {
        status: 'completed',
        transaction_id: refId,
        gateway_response: { authority, ref_id: refId },
        paid_at: new Date().toISOString(),
      });
    }

    return `${env.frontendUrl}/orders/${payment.order_id}?payment=success`;
  }
}
