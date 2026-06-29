// src/modules/blog/blog.validator.ts
import { z } from 'zod';

export const createBlogSchema = z.object({
  title: z
    .string()
    .min(3, 'عنوان باید حداقل ۳ کاراکتر باشد')
    .max(200, 'عنوان نمی‌تواند بیشتر از ۲۰۰ کاراکتر باشد'),
  content: z.string().min(20, 'محتوا باید حداقل ۲۰ کاراکتر باشد'),
  excerpt: z
    .string()
    .max(500, 'خلاصه نمی‌تواند بیشتر از ۵۰۰ کاراکتر باشد')
    .nullable()
    .optional(),
  cover_image: z.string().url('آدرس تصویر نامعتبر است').nullable().optional(),
  tags: z.array(z.string().min(1).max(50)).max(20).optional(),
  is_published: z.boolean().optional(),
  published_at: z.string().datetime().nullable().optional(),
  seo_title: z.string().max(200).nullable().optional(),
  seo_description: z.string().max(500).nullable().optional(),
  seo_keywords: z.string().max(300).nullable().optional(),
});

export const updateBlogSchema = createBlogSchema.partial();

export const blogQuerySchema = z.object({
  search: z.string().optional(),
  tag: z.string().optional(),
  is_published: z
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
  sort_by: z.enum(['created_at', 'published_at', 'view_count', 'title']).optional(),
  sort_order: z.enum(['ASC', 'DESC']).optional(),
});
