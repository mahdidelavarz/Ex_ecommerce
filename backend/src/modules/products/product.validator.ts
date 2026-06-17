// src/modules/products/product.validator.ts
import { z } from 'zod';

export const createProductSchema = z.object({
  category_id: z.string().uuid('دسته‌بندی نامعتبر است'),
  brand_id: z.string().uuid().nullable().optional(),
  title: z.string().min(2, 'عنوان باید حداقل ۲ کاراکتر باشد').max(200),
  short_description: z.string().max(500).nullable().optional(),
  full_description: z.string().nullable().optional(),
  specification: z.record(z.any()).nullable().optional(),
  seo_title: z.string().max(200).nullable().optional(),
  seo_description: z.string().max(500).nullable().optional(),
  is_active: z.boolean().optional(),
  is_public: z.boolean().optional(),
  images: z.array(z.object({
    image_url: z.string(),
    alt_text: z.string().optional(),
    is_thumbnail: z.boolean().optional(),
    sort_order: z.number().optional(),
  })).optional(),
  tag_ids: z.array(z.string().uuid()).optional(),
});

export const updateProductSchema = z.object({
  category_id: z.string().uuid().optional(),
  brand_id: z.string().uuid().nullable().optional(),
  title: z.string().min(2).max(200).optional(),
  short_description: z.string().max(500).nullable().optional(),
  full_description: z.string().nullable().optional(),
  specification: z.record(z.any()).nullable().optional(),
  seo_title: z.string().max(200).nullable().optional(),
  seo_description: z.string().max(500).nullable().optional(),
  is_active: z.boolean().optional(),
  is_public: z.boolean().optional(),
});

export const bulkStatusSchema = z.object({
  ids: z.array(z.string().uuid()),
  is_active: z.boolean(),
});

export const productQuerySchema = z.object({
  category_id: z.string().uuid().optional(),
  brand_id: z.string().uuid().optional(),
  tag: z.string().optional(),
  search: z.string().optional(),
  min_price: z.string().transform(Number).optional(),
  max_price: z.string().transform(Number).optional(),
  is_active: z.string().transform((v) => v === 'true' ? true : v === 'false' ? false : undefined).optional(),
  is_public: z.string().transform((v) => v === 'true' ? true : v === 'false' ? false : undefined).optional(),
  has_stock: z.string().transform((v) => v === 'true').optional(),
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
  sort_by: z.enum(['title', 'price', 'created_at', 'stock']).optional(),
  sort_order: z.enum(['ASC', 'DESC']).optional(),
});