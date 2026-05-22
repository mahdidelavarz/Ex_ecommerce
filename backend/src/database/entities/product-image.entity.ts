// src/database/entities/product-image.entity.ts
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { Product } from './product.entity';

@Entity('product_images')
export class ProductImage extends BaseEntity {
  @Column({ type: 'uuid', primary: true, generated: 'uuid' })
  id: string;

  @Column({ type: 'uuid' })
  product_id: string;

  @Column({ type: 'text' })
  image_url: string;

  @Column({ type: 'text', nullable: true })
  alt_text: string | null;

  @Column({ type: 'int', default: 0 })
  sort_order: number;

  @Column({ type: 'boolean', default: false })
  is_thumbnail: boolean;

  @ManyToOne(() => Product, (product) => product.images, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;
}