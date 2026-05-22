// src/database/entities/cart.entity.ts
import { Entity, Column, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { User } from './user.entity';
import { CartItem } from './cart-item.entity';

@Entity('carts')
export class Cart extends BaseEntity {
  @Column({ type: 'uuid', primary: true, generated: 'uuid' })
  id: string;

  @Column({ type: 'uuid', unique: true, nullable: true })
  @Index()
  user_id: string | null;

  @Column({ type: 'text', unique: true, nullable: true })
  @Index()
  session_id: string | null;

  @ManyToOne(() => User, (user) => user.carts, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User | null;

  @OneToMany(() => CartItem, (item) => item.cart)
  items: CartItem[];
}