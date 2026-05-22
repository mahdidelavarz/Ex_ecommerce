// src/database/entities/product-tag.entity.ts
import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { Product } from './product.entity';
import { Tag } from './tag.entity';

@Entity('product_tags')
@Unique('uq_product_tag', ['product_id', 'tag_id'])
export class ProductTag extends BaseEntity {
  @Column({ type: 'uuid' })
  product_id: string;

  @Column({ type: 'uuid' })
  tag_id: string;

  @ManyToOne(() => Product, (product) => product.product_tags, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => Tag, (tag) => tag.product_tags, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tag_id' })
  tag: Tag;
}