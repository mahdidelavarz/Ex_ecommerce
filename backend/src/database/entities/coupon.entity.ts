// src/database/entities/coupon.entity.ts
import { Entity, Column, OneToMany, Index } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { CouponProduct } from './coupon-product.entity';
import { CouponCategory } from './coupon-category.entity';
import { Order } from './order.entity';


export enum CouponType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
  FREE_SHIPPING = 'free_shipping',
}

@Entity('coupons')
export class Coupon extends BaseEntity {
  @Column({ type: 'uuid', primary: true, generated: 'uuid' })
  id: string;

  @Column({ type: 'text', unique: true })
  @Index()
  code: string;

  @Column({ type: 'enum', enum: CouponType })
  type: CouponType;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  value: number;

  @Column({ type: 'numeric', nullable: true })
  min_order_amount: number | null;

  @Column({ type: 'numeric', nullable: true })
  max_discount: number | null;

  @Column({ type: 'int', nullable: true })
  usage_limit: number | null;

  @Column({ type: 'int', nullable: true })
  usage_per_user: number | null;

  @Column({ type: 'timestamptz' })
  starts_at: Date;

  @Column({ type: 'timestamptz' })
  expires_at: Date;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @OneToMany(() => CouponProduct, (cp) => cp.coupon)
  coupon_products: CouponProduct[];

  @OneToMany(() => CouponCategory, (cc) => cc.coupon)
  coupon_categories: CouponCategory[];

  @OneToMany(() => Order, (order) => order.coupon)
  orders: Order[];
}