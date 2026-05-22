// src/database/entities/inventory-log.entity.ts
import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { ProductVariant } from './product-variant.entity';
import { User } from './user.entity';

export enum InventoryLogType {
  ORDER_PLACED = 'order_placed',
  ORDER_CANCELLED = 'order_cancelled',
  RETURN_RECEIVED = 'return_received',
  STOCK_ADJUSTMENT = 'stock_adjustment',
  STOCK_IMPORT = 'stock_import',
  DAMAGE_LOSS = 'damage_loss',
}

@Entity('inventory_logs')
export class InventoryLog extends BaseEntity {
  @Column({ type: 'uuid', primary: true, generated: 'uuid' })
  id: string;

  @Column({ type: 'uuid' })
  variant_id: string;

  @Column({ type: 'enum', enum: InventoryLogType })
  type: InventoryLogType;

  @Column({ type: 'int' })
  quantity_before: number;

  @Column({ type: 'int' })
  quantity_change: number;

  @Column({ type: 'int' })
  quantity_after: number;

  @Column({ type: 'text' })
  reference_type: string;

  @Column({ type: 'uuid', nullable: true })
  reference_id: string | null;

  @Column({ type: 'text', nullable: true })
  note: string | null;

  @Column({ type: 'uuid', nullable: true })
  created_by: string | null;

  @ManyToOne(() => ProductVariant, (variant) => variant.inventory_logs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'variant_id' })
  variant: ProductVariant;

  @ManyToOne(() => User, (user) => user.inventory_logs, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by' })
  created_by_user: User | null;
}