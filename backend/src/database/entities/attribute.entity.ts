// src/database/entities/attribute.entity.ts
import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { AttributeValue } from './attribute-value.entity';

export enum AttributeType {
  COLOR = 'color',
  SIZE = 'size',
  TEXT = 'text',
}

@Entity('attributes')
export class Attribute extends BaseEntity {
  @Column({ type: 'uuid', primary: true, generated: 'uuid' })
  id: string;

  @Column({ type: 'text', unique: true })
  name: string;

  @Column({ type: 'varchar', default: AttributeType.TEXT })
  type: AttributeType;

  @OneToMany(() => AttributeValue, (value) => value.attribute)
  values: AttributeValue[];
}