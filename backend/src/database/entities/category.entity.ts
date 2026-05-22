// src/database/entities/category.entity.ts
import { Entity, Column, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { Product } from './product.entity';

@Entity('categories')
export class Category extends BaseEntity {
  @Column({ type: 'uuid', primary: true, generated: 'uuid' })
  id: string;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  parent_id: string | null;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text', unique: true })
  @Index()
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'text', nullable: true })
  image: string | null;

  @Column({ type: 'text', nullable: true })
  icon: string | null;

  @Column({ type: 'text', nullable: true })
  color: string | null;

  @Column({ type: 'int', default: 0 })
  sort_order: number;

  @Column({ type: 'text', nullable: true })
  seo_title: string | null;

  @Column({ type: 'text', nullable: true })
  seo_description: string | null;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @ManyToOne(() => Category, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'parent_id' })
  parent: Category | null;

  @OneToMany(() => Category, (category) => category.parent)
  children: Category[];

  @OneToMany(() => Product, (product) => product.category)
  products: Product[];
}