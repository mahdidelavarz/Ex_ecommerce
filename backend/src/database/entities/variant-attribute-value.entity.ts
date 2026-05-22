// src/database/entities/variant-attribute-value.entity.ts
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { ProductVariant } from './product-variant.entity';
import { AttributeValue } from './attribute-value.entity';

@Entity('variant_attribute_values')
export class VariantAttributeValue extends BaseEntity {
  @Column({ type: 'uuid', primary: true, generated: 'uuid' })
  id: string;

  @Column({ type: 'uuid' })
  variant_id: string;

  @Column({ type: 'uuid' })
  attribute_value_id: string;

  @ManyToOne(() => ProductVariant, (variant) => variant.variant_attribute_values, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'variant_id' })
  variant: ProductVariant;

  @ManyToOne(() => AttributeValue, (value) => value.variant_attribute_values, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'attribute_value_id' })
  attribute_value: AttributeValue;
}