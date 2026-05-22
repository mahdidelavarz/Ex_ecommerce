// src/database/entities/order-item.entity.ts
import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { Order } from './order.entity';
import { ProductVariant } from './product-variant.entity';
import { ReturnItem } from './return-item.entity';

@Entity('order_items')
export class OrderItem extends BaseEntity {
  @Column({ type: 'uuid', primary: true, generated: 'uuid' })
  id: string;

  @Column({ type: 'uuid' })
  order_id: string;

  @Column({ type: 'uuid', nullable: true })
  variant_id: string | null;

  @Column({ type: 'text' })
  product_title: string;

  @Column({ type: 'text', nullable: true })
  variant_title: string | null;

  @Column({ type: 'text' })
  sku: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  unit_price: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  discount_amount: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  tax_amount: number;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  total_amount: number;

  @Column({ type: 'jsonb' })
  product_snapshot: Record<string, any>;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => ProductVariant, (variant) => variant.order_items, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'variant_id' })
  variant: ProductVariant | null;

  @OneToMany(() => ReturnItem, (item) => item.order_item)
  return_items: ReturnItem[];
}