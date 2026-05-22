// src/database/entities/user.entity.ts
import { Entity, Column, OneToMany, Index } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { UserAddress } from './user-address.entity';
import { Cart } from './cart.entity';
import { Order } from './order.entity';
import { Review } from './review.entity';
import { Wishlist } from './wishlist.entity';
import { Return } from './return.entity';
import { RefreshToken } from './refresh-token.entity';
import { LoginLog } from './login-log.entity';
import { InventoryLog } from './inventory-log.entity';

export enum UserRole {
  CUSTOMER = 'customer',
  ADMIN = 'admin',
  SUPPORT = 'support',
}

@Entity('users')
export class User extends BaseEntity {
  @Column({ type: 'uuid', primary: true, generated: 'uuid' })
  id: string;

  @Column({ type: 'text', unique: true, nullable: true })
  @Index()
  email: string | null;

  @Column({ type: 'text', unique: true, nullable: true })
  @Index()
  phone_number: string | null;

  @Column({ type: 'text' })
  full_name: string;

  @Column({ type: 'date', nullable: true })
  birthday: Date | null;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.CUSTOMER })
  role: UserRole;

  @Column({ type: 'boolean', default: false })
  is_active: boolean;

  @Column({ type: 'boolean', default: false })
  profile_completed: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  last_login_at: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  deleted_at: Date | null;

  @OneToMany(() => UserAddress, (address) => address.user)
  addresses: UserAddress[];

  @OneToMany(() => Cart, (cart) => cart.user)
  carts: Cart[];

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @OneToMany(() => Review, (review) => review.user)
  reviews: Review[];

  @OneToMany(() => Wishlist, (wishlist) => wishlist.user)
  wishlists: Wishlist[];

  @OneToMany(() => Return, (ret) => ret.user)
  returns: Return[];

  @OneToMany(() => RefreshToken, (token) => token.user)
  refresh_tokens: RefreshToken[];

  @OneToMany(() => LoginLog, (log) => log.user)
  login_logs: LoginLog[];

  @OneToMany(() => InventoryLog, (log) => log.created_by_user)
  inventory_logs: InventoryLog[];
}