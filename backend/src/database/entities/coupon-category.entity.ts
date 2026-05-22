// src/database/entities/coupon-category.entity.ts
import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { Coupon } from './coupon.entity';
import { Category } from './category.entity';

@Entity('coupon_categories')
@Unique('uq_coupon_category', ['coupon_id', 'category_id'])
export class CouponCategory extends BaseEntity {
  @Column({ type: 'uuid', primary: true, generated: 'uuid' })
  id: string;

  @Column({ type: 'uuid' })
  coupon_id: string;

  @Column({ type: 'uuid' })
  category_id: string;

  @ManyToOne(() => Coupon, (coupon) => coupon.coupon_categories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'coupon_id' })
  coupon: Coupon;

  @ManyToOne(() => Category, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'category_id' })
  category: Category;
}