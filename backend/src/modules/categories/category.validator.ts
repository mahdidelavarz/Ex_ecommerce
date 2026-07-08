// src/modules/categories/category.validator.ts
import { z } from 'zod';

const iconifyPattern = /^[a-z0-9-]+:[a-z0-9-]+$/;
const nullableUuidQuery = z.preprocess(
  (val) => (val === 'null' ? null : val),
  z.string().uuid().nullable().optional()
);

export const createCategorySchema = z.object({
  parent_id: z.string().uuid('شناسه والد نامعتبر است').nullable().optional(),
  name: z
    .string()
    .min(2, 'نام دسته‌بندی باید حداقل ۲ کاراکتر باشد')
    .max(100, 'نام دسته‌بندی نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد'),
  description: z.string().nullable().optional(),
  image: z.string().url('آدرس تصویر نامعتبر است').nullable().optional(),
  icon: z.string()
    .refine((val) => !val || iconifyPattern.test(val), 'فرمت آیکون نامعتبر است (مثال: mdi:folder)')
    .nullable()
    .optional(),
  color: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'کد رنگ نامعتبر است')
    .nullable()
    .optional(),
  sort_order: z.number().int().min(0).optional(),
  is_active: z.boolean().optional(),
  seo_title: z.string().max(200, 'عنوان سئو نمی‌تواند بیشتر از ۲۰۰ کاراکتر باشد').nullable().optional(),
  seo_description: z.string().max(500, 'توضیحات سئو نمی‌تواند بیشتر از ۵۰۰ کاراکتر باشد').nullable().optional(),
}).refine((d) => !(d.icon && d.image), {
  message: 'فقط یکی از آیکون یا تصویر مجاز است',
  path: ['icon'],
});

export const updateCategorySchema = z.object({
  parent_id: z.string().uuid('شناسه والد نامعتبر است').nullable().optional(),
  name: z
    .string()
    .min(2, 'نام دسته‌بندی باید حداقل ۲ کاراکتر باشد')
    .max(100, 'نام دسته‌بندی نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد')
    .optional(),
  description: z.string().nullable().optional(),
  image: z.string().url('آدرس تصویر نامعتبر است').nullable().optional(),
  icon: z.string()
    .refine((val) => !val || iconifyPattern.test(val), 'فرمت آیکون نامعتبر است (مثال: mdi:folder)')
    .nullable()
    .optional(),
  color: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'کد رنگ نامعتبر است')
    .nullable()
    .optional(),
  sort_order: z.number().int().min(0).optional(),
  is_active: z.boolean().optional(),
  seo_title: z.string().max(200, 'عنوان سئو نمی‌تواند بیشتر از ۲۰۰ کاراکتر باشد').nullable().optional(),
  seo_description: z.string().max(500, 'توضیحات سئو نمی‌تواند بیشتر از ۵۰۰ کاراکتر باشد').nullable().optional(),
}).refine((d) => !(d.icon && d.image), {
  message: 'فقط یکی از آیکون یا تصویر مجاز است',
  path: ['icon'],
});

export const bulkSortSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().uuid(),
      sort_order: z.number().int().min(0),
    })
  ),
});

export const categoryQuerySchema = z.object({
  parent_id: nullableUuidQuery,
  is_active: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  has_image: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  search: z.string().optional(),
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
  sort_by: z.enum(['name', 'sort_order', 'created_at']).optional(),
  sort_order: z.enum(['ASC', 'DESC']).optional(),
});
