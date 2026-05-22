// src/database/entities/otp-code.entity.ts
import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../base.entity';

@Entity('otp_codes')
export class OtpCode extends BaseEntity {
  @Column({ type: 'uuid', primary: true, generated: 'uuid' })
  id: string;

  @Column({ type: 'text' })
  @Index()
  phone_number: string;

  @Column({ type: 'text' })
  otp_hash: string;

  @Column({ type: 'int', default: 0 })
  attempts: number;

  @Column({ type: 'timestamptz' })
  expires_at: Date;

  @Column({ type: 'boolean', default: false })
  verified: boolean;
}