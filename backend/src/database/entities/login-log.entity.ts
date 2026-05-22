// src/database/entities/login-log.entity.ts
import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { User } from './user.entity';

@Entity('login_logs')
export class LoginLog extends BaseEntity {
  @Column({ type: 'uuid', primary: true, generated: 'uuid' })
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  user_id: string;

  @Column({ type: 'text', nullable: true })
  ip_address: string | null;

  @Column({ type: 'text', nullable: true })
  user_agent: string | null;

  @Column({ type: 'timestamptz' })
  logged_in_at: Date;

  @ManyToOne(() => User, (user) => user.login_logs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}