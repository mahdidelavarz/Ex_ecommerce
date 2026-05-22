// src/database/entities/return-item.entity.ts
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { Return } from './return.entity';
import { OrderItem } from './order-item.entity';

@Entity('return_items')
export class ReturnItem extends BaseEntity {
  @Column({ type: 'uuid', primary: true, generated: 'uuid' })
  id: string;

  @Column({ type: 'uuid' })
  return_id: string;

  @Column({ type: 'uuid' })
  order_item_id: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'text', nullable: true })
  reason: string | null;

  @ManyToOne(() => Return, (ret) => ret.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'return_id' })
  return: Return;

  @ManyToOne(() => OrderItem, (item) => item.return_items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_item_id' })
  order_item: OrderItem;
}