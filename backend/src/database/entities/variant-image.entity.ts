// src/database/entities/variant-image.entity.ts
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { ProductVariant } from './product-variant.entity';

@Entity('variant_images')
export class VariantImage extends BaseEntity {
  @Column({ type: 'uuid', primary: true, generated: 'uuid' })
  id: string;

  @Column({ type: 'uuid' })
  variant_id: string;

  @Column({ type: 'text' })
  image_url: string;

  @Column({ type: 'int', default: 0 })
  sort_order: number;

  @ManyToOne(() => ProductVariant, (variant) => variant.images, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'variant_id' })
  variant: ProductVariant;
}