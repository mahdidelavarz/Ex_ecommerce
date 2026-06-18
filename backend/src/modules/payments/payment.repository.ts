// src/modules/payments/payment.repository.ts
import { AppDataSource } from "../../config/database";
import { Payment } from "../../database/entities/payment.entity";
import { Order } from "../../database/entities/order.entity";
import { NotFoundError } from "../../shared/utils/errors";
import { CreatePaymentDto, UpdatePaymentDto } from "./payment.types";

export class PaymentRepository {
  private repo = AppDataSource.getRepository(Payment);
  private orderRepo = AppDataSource.getRepository(Order);

  async findByOrder(orderId: string) {
    return this.repo.find({
      where: { order_id: orderId },
      order: { created_at: "DESC" },
    });
  }

  async findById(id: string) {
    const payment = await this.repo.findOne({ where: { id } });
    if (!payment) throw new NotFoundError("پرداخت یافت نشد");
    return payment;
  }

  async findByTransactionId(transactionId: string) {
    return this.repo.findOne({ where: { transaction_id: transactionId } });
  }

  async create(dto: CreatePaymentDto) {
    const order = await this.orderRepo.findOne({ where: { id: dto.order_id } });
    if (!order) throw new NotFoundError("سفارش یافت نشد");

    const result = await this.repo.insert({
      order_id: dto.order_id,
      provider: dto.provider,
      method: dto.method,
      amount: dto.amount,
      currency_code: order.currency_code || "IRR",
      status: "pending" as any,
      transaction_id: dto.transaction_id ?? null,
    } as any);

    const payment = await this.repo.findOne({
      where: { id: result.identifiers[0].id },
    });

    await this.orderRepo.update(dto.order_id, {
      payment_status: "pending" as any,
    });

    return payment!;
  }

  async update(id: string, dto: UpdatePaymentDto) {
    const payment = await this.repo.findOne({ where: { id } });
    if (!payment) throw new NotFoundError("پرداخت یافت نشد");

    const updateData: any = {};
    if (dto.status) updateData.status = dto.status;
    if (dto.transaction_id !== undefined)
      updateData.transaction_id = dto.transaction_id;
    if (dto.gateway_response !== undefined)
      updateData.gateway_response = dto.gateway_response;
    if (dto.paid_at) updateData.paid_at = new Date(dto.paid_at);
    if (dto.refund_amount !== undefined)
      updateData.refund_amount = dto.refund_amount;

    await this.repo.update(id, updateData);

    if (dto.status) {
      const orderUpdate: any = {};
      if (dto.status === "completed") {
        // PAY-B4: accumulate paid_amount correctly instead of using stale snapshot
        const order = await this.orderRepo.findOne({ where: { id: payment.order_id } });
        const addedAmount = Number(dto.amount ?? payment.amount);
        const newPaid = Number(order!.paid_amount ?? 0) + addedAmount;
        orderUpdate.payment_status = "paid";
        orderUpdate.paid_amount = newPaid;
        orderUpdate.due_amount = Math.max(0, Number(order!.total_amount) - newPaid);
      } else if (dto.status === "failed") {
        orderUpdate.payment_status = "failed";
      } else if (dto.status === "refunded") {
        orderUpdate.payment_status = "refunded";
      }
      if (Object.keys(orderUpdate).length > 0) {
        await this.orderRepo.update(payment.order_id, orderUpdate);
      }
    }

    return this.repo.findOne({ where: { id } }) as any;
  }
}
