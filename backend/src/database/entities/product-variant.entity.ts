// src/database/entities/product-variant.entity.ts
import { Entity, Column, ManyToOne, OneToMany, JoinColumn, Index, DeleteDateColumn } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { Product } from './product.entity';
import { VariantAttributeValue } from './variant-attribute-value.entity';
import { VariantImage } from './variant-image.entity';
import { CartItem } from './cart-item.entity';
import { OrderItem } from './order-item.entity';
import { Wishlist } from './wishlist.entity';
import { InventoryLog } from './inventory-log.entity';

@Entity('product_variants')
export class ProductVariant extends BaseEntity {
  @Column({ type: 'uuid', primary: true, generated: 'uuid' })
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  product_id: string;

  @Column({ type: 'text', unique: true })
  @Index()
  sku: string;

  @Column({ type: 'text', nullable: true })
  barcode: string | null;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  price: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  compare_at_price: number | null;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  cost: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  weight: number | null;

  @Column({ type: 'int', default: 0 })
  @Index()
  stock_quantity: number;

  @Column({ type: 'int', nullable: true })
  low_stock_threshold: number | null;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @ManyToOne(() => Product, (product) => product.variants, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @OneToMany(() => VariantAttributeValue, (vav) => vav.variant)
  variant_attribute_values: VariantAttributeValue[];

  @OneToMany(() => VariantImage, (image) => image.variant)
  images: VariantImage[];

  @OneToMany(() => CartItem, (item) => item.variant)
  cart_items: CartItem[];

  @OneToMany(() => OrderItem, (item) => item.variant)
  order_items: OrderItem[];

  @OneToMany(() => Wishlist, (wishlist) => wishlist.variant)
  wishlists: Wishlist[];

  @OneToMany(() => InventoryLog, (log) => log.variant)
  inventory_logs: InventoryLog[];

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deleted_at: Date | null;
}