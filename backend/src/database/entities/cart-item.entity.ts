// src/database/entities/cart-item.entity.ts
import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { Cart } from './cart.entity';
import { ProductVariant } from './product-variant.entity';

@Entity('cart_items')
@Unique('uq_cart_variant', ['cart_id', 'variant_id'])
export class CartItem extends BaseEntity {
  @Column({ type: 'uuid', primary: true, generated: 'uuid' })
  id: string;

  @Column({ type: 'uuid' })
  cart_id: string;

  @Column({ type: 'uuid' })
  variant_id: string;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @ManyToOne(() => Cart, (cart) => cart.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cart_id' })
  cart: Cart;

  @ManyToOne(() => ProductVariant, (variant) => variant.cart_items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'variant_id' })
  variant: ProductVariant;
}