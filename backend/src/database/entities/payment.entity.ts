// src/database/entities/payment.entity.ts
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { Order } from './order.entity';

export enum PaymentStatusEnum {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
  CANCELLED = 'cancelled',
}

@Entity('payments')
export class Payment extends BaseEntity {
  @Column({ type: 'uuid', primary: true, generated: 'uuid' })
  id: string;

  @Column({ type: 'uuid' })
  order_id: string;

  @Column({ type: 'text' })
  provider: string;

  @Column({ type: 'text' })
  method: string;

  @Column({ type: 'text', nullable: true })
  transaction_id: string | null;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'text' })
  currency_code: string;

  @Column({ type: 'enum', enum: PaymentStatusEnum })
  status: PaymentStatusEnum;

  @Column({ type: 'jsonb', nullable: true })
  gateway_response: Record<string, any> | null;

  @Column({ type: 'timestamptz', nullable: true })
  paid_at: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  refunded_at: Date | null;

  @Column({ type: 'numeric', nullable: true })
  refund_amount: number | null;

  @ManyToOne(() => Order, (order) => order.payments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;
}