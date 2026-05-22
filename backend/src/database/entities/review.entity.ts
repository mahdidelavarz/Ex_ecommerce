// src/database/entities/review.entity.ts
import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { Product } from './product.entity';
import { User } from './user.entity';

@Entity('reviews')
@Unique('uq_user_product', ['user_id', 'product_id'])
export class Review extends BaseEntity {
  @Column({ type: 'uuid', primary: true, generated: 'uuid' })
  id: string;

  @Column({ type: 'uuid' })
  product_id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'int' })
  rating: number;

  @Column({ type: 'text', nullable: true })
  title: string | null;

  @Column({ type: 'text', nullable: true })
  comment: string | null;

  @Column({ type: 'boolean', default: false })
  verified_purchase: boolean;

  @Column({ type: 'int', default: 0 })
  helpful_count: number;

  @Column({ type: 'boolean', default: false })
  is_approved: boolean;

  @Column({ type: 'text', nullable: true })
  admin_reply: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  replied_at: Date | null;

  @ManyToOne(() => Product, (product) => product.reviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => User, (user) => user.reviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}