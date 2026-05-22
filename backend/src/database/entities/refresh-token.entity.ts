// src/database/entities/refresh-token.entity.ts
import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { User } from './user.entity';

@Entity('refresh_tokens')
export class RefreshToken extends BaseEntity {
  @Column({ type: 'uuid', primary: true, generated: 'uuid' })
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  user_id: string;

  @Column({ type: 'text' })
  token_hash: string;

  @Column({ type: 'text', nullable: true })
  ip_address: string | null;

  @Column({ type: 'text', nullable: true })
  user_agent: string | null;

  @Column({ type: 'boolean', default: false })
  revoked: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  revoked_at: Date | null;

  @Column({ type: 'timestamptz' })
  expires_at: Date;

  @Column({ type: 'timestamptz', nullable: true })
  last_used_at: Date | null;

  @ManyToOne(() => User, (user) => user.refresh_tokens, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}