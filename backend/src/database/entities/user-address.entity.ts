// src/database/entities/user-address.entity.ts
import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { User } from './user.entity';

@Entity('user_addresses')
@Index('uq_user_default_shipping', ['user_id', 'is_default_shipping'], {
  unique: true,
  where: 'is_default_shipping = true',
})
export class UserAddress extends BaseEntity {
  @Column({ type: 'uuid', primary: true, generated: 'uuid' })
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'text' })
  full_name: string;

  @Column({ type: 'text' })
  phone: string;

  @Column({ type: 'text' })
  country: string;

  @Column({ type: 'text' })
  state: string;

  @Column({ type: 'text' })
  city: string;

  @Column({ type: 'text' })
  address_line_1: string;

  @Column({ type: 'text', nullable: true })
  address_line_2: string | null;

  @Column({ type: 'text' })
  postal_code: string;

  @Column({ type: 'boolean', default: false })
  is_default_shipping: boolean;

  @Column({ type: 'boolean', default: false })
  is_default_billing: boolean;

  @ManyToOne(() => User, (user) => user.addresses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}