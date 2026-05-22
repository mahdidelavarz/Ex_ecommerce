// src/database/entities/coupon-product.entity.ts
import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { Coupon } from './coupon.entity';
import { Product } from './product.entity';

@Entity('coupon_products')
@Unique('uq_coupon_product', ['coupon_id', 'product_id'])
export class CouponProduct extends BaseEntity {
  @Column({ type: 'uuid', primary: true, generated: 'uuid' })
  id: string;

  @Column({ type: 'uuid' })
  coupon_id: string;

  @Column({ type: 'uuid' })
  product_id: string;

  @ManyToOne(() => Coupon, (coupon) => coupon.coupon_products, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'coupon_id' })
  coupon: Coupon;

  @ManyToOne(() => Product, (product) => product.coupon_products, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;
}