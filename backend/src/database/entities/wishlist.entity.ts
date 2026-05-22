// src/database/entities/wishlist.entity.ts
import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { User } from './user.entity';
import { ProductVariant } from './product-variant.entity';

@Entity('wishlists')
@Unique('uq_user_variant', ['user_id', 'variant_id'])
export class Wishlist extends BaseEntity {
  @Column({ type: 'uuid', primary: true, generated: 'uuid' })
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'uuid' })
  variant_id: string;

  @ManyToOne(() => User, (user) => user.wishlists, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => ProductVariant, (variant) => variant.wishlists, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'variant_id' })
  variant: ProductVariant;
}