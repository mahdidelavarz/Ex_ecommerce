// src/database/entities/order.entity.ts
import { Entity, Column, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { User } from './user.entity';
import { Coupon } from './coupon.entity';
import { OrderItem } from './order-item.entity';
import { Payment } from './payment.entity';
import { Shipment } from './shipment.entity';
import { Return } from './return.entity';

export enum PaymentStatus {
  PENDING = 'pending',
  PARTIALLY_PAID = 'partially_paid',
  PAID = 'paid',
  REFUNDED = 'refunded',
  FAILED = 'failed',
}

export enum FulfillmentStatus {
  UNFULFILLED = 'unfulfilled',
  PARTIALLY_FULFILLED = 'partially_fulfilled',
  FULFILLED = 'fulfilled',
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  RETURNED = 'returned',
}

@Entity('orders')
export class Order extends BaseEntity {
  @Column({ type: 'uuid', primary: true, generated: 'uuid' })
  id: string;

  @Column({ type: 'text', unique: true })
  order_number: string;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  user_id: string | null;

  @Column({ type: 'text', default: 'USD' })
  currency_code: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  subtotal: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  discount_amount: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  shipping_amount: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  tax_amount: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  total_amount: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  paid_amount: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  due_amount: number;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  @Index()
  payment_status: PaymentStatus;

  @Column({ type: 'enum', enum: FulfillmentStatus, default: FulfillmentStatus.UNFULFILLED })
  @Index()
  fulfillment_status: FulfillmentStatus;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  order_status: OrderStatus;

  @Column({ type: 'uuid', nullable: true })
  coupon_id: string | null;

  @Column({ type: 'jsonb' })
  shipping_address_snapshot: Record<string, any>;

  @Column({ type: 'jsonb' })
  billing_address_snapshot: Record<string, any>;

  @Column({ type: 'text' })
  customer_email: string;

  @Column({ type: 'text' })
  customer_phone: string;

  @Column({ type: 'text', nullable: true })
  customer_note: string | null;

  @Column({ type: 'text', nullable: true })
  admin_note: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  placed_at: Date | null;

  @ManyToOne(() => User, (user) => user.orders, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User | null;

  @ManyToOne(() => Coupon, (coupon) => coupon.orders, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'coupon_id' })
  coupon: Coupon | null;

  @OneToMany(() => OrderItem, (item) => item.order)
  items: OrderItem[];

  @OneToMany(() => Payment, (payment) => payment.order)
  payments: Payment[];

  @OneToMany(() => Shipment, (shipment) => shipment.order)
  shipments: Shipment[];

  @OneToMany(() => Return, (ret) => ret.order)
  returns: Return[];
}