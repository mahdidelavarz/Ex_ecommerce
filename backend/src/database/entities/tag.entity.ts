// src/database/entities/tag.entity.ts
import { Entity, Column, OneToMany, Index } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { ProductTag } from './product-tag.entity';

@Entity('tags')
export class Tag extends BaseEntity {
  @Column({ type: 'uuid', primary: true, generated: 'uuid' })
  id: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text', unique: true })
  @Index()
  slug: string;

  @OneToMany(() => ProductTag, (productTag) => productTag.tag)
  product_tags: ProductTag[];
}