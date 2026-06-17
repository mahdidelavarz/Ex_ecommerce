// src/modules/attributes/attribute.validator.ts
import { z } from 'zod';

const attributeTypeEnum = z.enum(['color', 'size', 'text']).default('text');

export const createAttributeSchema = z.object({
  name: z.string().min(1, 'نام ویژگی الزامی است').max(100),
  type: attributeTypeEnum,
  values: z.array(z.object({
    value: z.string().min(1, 'مقدار الزامی است').max(100),
    color_code: z.string().regex(/^#([A-Fa-f0-9]{6})$/, 'کد رنگ نامعتبر').optional(),
  })).optional(),
});

export const updateAttributeSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  type: z.enum(['color', 'size', 'text']).optional(),
});

export const createValueSchema = z.object({
  value: z.string().min(1, 'مقدار الزامی است').max(100),
  color_code: z.string().regex(/^#([A-Fa-f0-9]{6})$/, 'کد رنگ نامعتبر').optional(),
});

export const updateValueSchema = z.object({
  value: z.string().min(1).max(100).optional(),
  color_code: z.string().regex(/^#([A-Fa-f0-9]{6})$/, 'کد رنگ نامعتبر').nullable().optional(),
});

export const attributeQuerySchema = z.object({
  search: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});