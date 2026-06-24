// src/modules/returns/return.service.ts
import { AppDataSource } from '../../config/database';
import { Order, OrderStatus } from '../../database/entities/order.entity';
import { Payment, PaymentStatusEnum } from '../../database/entities/payment.entity';
import { NotFoundError, BadRequestError } from '../../shared/utils/errors';
import { ReturnRepository } from './return.repository';
import { ZarinpalService } from '../payments/gateway/zarinpal.service';
import { logger } from '../../shared/utils/logger';

const RETURN_WINDOW_DAYS = 14;

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  pending:  ['approved', 'rejected'],
  approved: ['received', 'rejected'],
  received: ['refunded'],
  rejected: [],
  refunded: [],
};

export class ReturnService {
  private repo = new ReturnRepository();
  private orderRepo = AppDataSource.getRepository(Order);
  private paymentRepo = AppDataSource.getRepository(Payment);
  private zarinpal = new ZarinpalService();

  async create(userId: string, dto: { order_id: string; reason: string; items: { order_item_id: string; quantity: number }[] }) {
    const order = await this.orderRepo.findOne({
      where: { id: dto.order_id, user_id: userId },
      relations: ['items'],
    });
    if (!order) throw new NotFoundError('سفارش یافت نشد');
    if (order.order_status !== OrderStatus.DELIVERED)
      throw new BadRequestError('فقط سفارش‌های تحویل‌شده قابل مرجوعی هستند');

    const daysSinceDelivery = (Date.now() - order.updated_at.getTime()) / 86_400_000;
    if (daysSinceDelivery > RETURN_WINDOW_DAYS)
      throw new BadRequestError(`مهلت مرجوعی ${RETURN_WINDOW_DAYS} روز از تاریخ تحویل است`);

    for (const item of dto.items) {
      const orderItem = order.items.find(i => i.id === item.order_item_id);
      if (!orderItem) throw new BadRequestError('آیتم درخواستی در این سفارش موجود نیست');
      if (item.quantity > orderItem.quantity) throw new BadRequestError('تعداد مرجوعی بیشتر از تعداد سفارش است');
    }

    return this.repo.create(userId, dto);
  }

  async findByUser(userId: string, page = 1, limit = 20) {
    return this.repo.findByUser(userId, page, limit);
  }

  async findByUserAndId(userId: string, id: string) {
    return this.repo.findByUserAndId(userId, id);
  }

  async findAllAdmin(options: { page: number; limit: number; status?: string }) {
    return this.repo.findAllAdmin(options);
  }

  async findByIdWithRelations(id: string) {
    return this.repo.findByIdWithRelations(id);
  }

  async updateStatus(id: string, dto: { status: string; admin_note?: string; refund_amount?: number }, userId?: string) {
    const ret = await this.repo.findByIdWithRelations(id);

    const allowed = ALLOWED_TRANSITIONS[ret.status] ?? [];
    if (!allowed.includes(dto.status))
      throw new BadRequestError(`تغییر وضعیت از ${ret.status} به ${dto.status} مجاز نیست`);

    if (dto.status === 'refunded') {
      if (!dto.refund_amount)
        throw new BadRequestError('مبلغ بازگشتی الزامی است');
      if (dto.refund_amount > Number(ret.order.total_amount))
        throw new BadRequestError('مبلغ بازگشتی نمی‌تواند از مبلغ سفارش بیشتر باشد');

      // Best-effort gateway refund (outside the DB transaction). The repo records
      // the refund state + refund_triggered_at regardless, so a sandbox/no-access
      // gateway failure doesn't block the workflow — finance reconciles manually.
      const payment = await this.paymentRepo.findOne({
        where: { order_id: ret.order_id, status: PaymentStatusEnum.COMPLETED },
        order: { created_at: 'DESC' },
      });
      if (payment?.transaction_id) {
        const ok = await this.zarinpal.refundPayment(
          payment.transaction_id,
          Number(dto.refund_amount),
        );
        if (!ok) {
          logger.warn(
            `Zarinpal refund not completed for return ${ret.return_number} (order ${ret.order_id}); recorded for manual reconciliation`,
          );
        }
      }
    }

    return this.repo.updateStatus(id, dto, userId);
  }
}
