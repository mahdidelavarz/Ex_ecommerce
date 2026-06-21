// src/database/entities/app-setting.entity.ts
import { Entity, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('app_settings')
export class AppSetting {
  @Column({ type: 'text', primary: true })
  key: string;

  @Column({ type: 'text' })
  value: string;

  @Column({ type: 'text' })
  label: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
