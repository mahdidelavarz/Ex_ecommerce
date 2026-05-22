// src/database/entities/product.entity.ts
import { Entity, Column, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { Category } from './category.entity';
import { Brand } from './brand.entity';
import { ProductImage } from './product-image.entity';
import { ProductVariant } from './product-variant.entity';
import { Review } from './review.entity';
import { ProductTag } from './product-tag.entity';
import { CouponProduct } from './coupon-product.entity';

@Entity('products')
export class Product extends BaseEntity {
  @Column({ type: 'uuid', primary: true, generated: 'uuid' })
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  category_id: string;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  brand_id: string | null;

  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'text', unique: true })
  @Index()
  slug: string;

  @Column({ type: 'text', nullable: true })
  short_description: string | null;

  @Column({ type: 'text', nullable: true })
  full_description: string | null;

  @Column({ type: 'jsonb', nullable: true })
  specification: Record<string, any> | null;

  @Column({ type: 'text', nullable: true })
  seo_title: string | null;

  @Column({ type: 'text', nullable: true })
  seo_description: string | null;

  @Column({ type: 'boolean', default: false })
  is_active: boolean;

  @Column({ type: 'boolean', default: false })
  @Index()
  is_public: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  deleted_at: Date | null;

  @ManyToOne(() => Category, (category) => category.products, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @ManyToOne(() => Brand, (brand) => brand.products, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'brand_id' })
  brand: Brand | null;

  @OneToMany(() => ProductImage, (image) => image.product)
  images: ProductImage[];

  @OneToMany(() => ProductVariant, (variant) => variant.product)
  variants: ProductVariant[];

  @OneToMany(() => Review, (review) => review.product)
  reviews: Review[];

  @OneToMany(() => ProductTag, (productTag) => productTag.product)
  product_tags: ProductTag[];

  @OneToMany(() => CouponProduct, (couponProduct) => couponProduct.product)
  coupon_products: CouponProduct[];
}