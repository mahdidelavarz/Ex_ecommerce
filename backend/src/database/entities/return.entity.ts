// src/database/entities/return.entity.ts
import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { Order } from './order.entity';
import { User } from './user.entity';
import { ReturnItem } from './return-item.entity';

export enum ReturnStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  RECEIVED = 'received',
  REFUNDED = 'refunded',
}

@Entity('returns')
export class Return extends BaseEntity {
  @Column({ type: 'uuid', primary: true, generated: 'uuid' })
  id: string;

  @Column({ type: 'uuid' })
  order_id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'text', unique: true })
  return_number: string;

  @Column({ type: 'text' })
  reason: string;

  @Column({ type: 'enum', enum: ReturnStatus, default: ReturnStatus.PENDING })
  status: ReturnStatus;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  refund_amount: number;

  @Column({ type: 'text', nullable: true })
  admin_note: string | null;

  @ManyToOne(() => Order, (order) => order.returns, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => User, (user) => user.returns, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => ReturnItem, (item) => item.return)
  items: ReturnItem[];
}