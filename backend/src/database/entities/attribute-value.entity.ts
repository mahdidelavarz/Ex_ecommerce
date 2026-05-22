// src/database/entities/attribute-value.entity.ts
import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { Attribute } from './attribute.entity';
import { VariantAttributeValue } from './variant-attribute-value.entity';

@Entity('attribute_values')
export class AttributeValue extends BaseEntity {
  @Column({ type: 'uuid', primary: true, generated: 'uuid' })
  id: string;

  @Column({ type: 'uuid' })
  attribute_id: string;

  @Column({ type: 'text' })
  value: string;

  @Column({ type: 'text', nullable: true })
  color_code: string | null;

  @ManyToOne(() => Attribute, (attribute) => attribute.values, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'attribute_id' })
  attribute: Attribute;

  @OneToMany(() => VariantAttributeValue, (vav) => vav.attribute_value)
  variant_attribute_values: VariantAttributeValue[];
}