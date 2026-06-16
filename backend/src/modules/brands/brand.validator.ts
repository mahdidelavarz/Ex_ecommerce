// src/modules/brands/brand.validator.ts
import { z } from 'zod';

export const createBrandSchema = z.object({
  name: z
    .string()
    .min(2, 'نام برند باید حداقل ۲ کاراکتر باشد')
    .max(100, 'نام برند نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد'),
  logo: z.string().url('آدرس لوگو نامعتبر است').nullable().optional(),
  description: z.string().max(500, 'توضیحات نمی‌تواند بیشتر از ۵۰۰ کاراکتر باشد').nullable().optional(),
  is_active: z.boolean().optional(),
});

export const updateBrandSchema = z.object({
  name: z
    .string()
    .min(2, 'نام برند باید حداقل ۲ کاراکتر باشد')
    .max(100, 'نام برند نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد')
    .optional(),
  logo: z.string().url('آدرس لوگو نامعتبر است').nullable().optional(),
  description: z.string().max(500, 'توضیحات نمی‌تواند بیشتر از ۵۰۰ کاراکتر باشد').nullable().optional(),
  is_active: z.boolean().optional(),
});

export const brandQuerySchema = z.object({
  search: z.string().optional(),
  is_active: z
    .string()
    .transform((val) => (val === 'true' ? true : val === 'false' ? false : undefined))
    .optional(),
  page: z
    .string()
    .transform(Number)
    .pipe(z.number().int().min(1))
    .optional(),
  limit: z
    .string()
    .transform(Number)
    .pipe(z.number().int().min(1).max(100))
    .optional(),
  sort_by: z.enum(['name', 'created_at']).optional(),
  sort_order: z.enum(['ASC', 'DESC']).optional(),
});