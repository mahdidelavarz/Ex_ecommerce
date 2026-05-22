// src/database/entities/shipment.entity.ts
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { Order } from './order.entity';

export enum ShipmentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  IN_TRANSIT = 'in_transit',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  RETURNED = 'returned',
}

@Entity('shipments')
export class Shipment extends BaseEntity {
  @Column({ type: 'uuid', primary: true, generated: 'uuid' })
  id: string;

  @Column({ type: 'uuid' })
  order_id: string;

  @Column({ type: 'text', unique: true })
  tracking_number: string;

  @Column({ type: 'text' })
  courier_name: string;

  @Column({ type: 'text', nullable: true })
  tracking_url: string | null;

  @Column({ type: 'enum', enum: ShipmentStatus, default: ShipmentStatus.PENDING })
  status: ShipmentStatus;

  @Column({ type: 'timestamptz', nullable: true })
  shipped_at: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  delivered_at: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  estimated_delivery_at: Date | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @ManyToOne(() => Order, (order) => order.shipments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;
}