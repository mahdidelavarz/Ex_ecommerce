// src/modules/variants/variant.validator.ts
import { z } from 'zod';

export const createVariantSchema = z.object({
  sku: z.string().min(1, 'کد محصول الزامی است').max(100),
  barcode: z.string().nullable().optional(),
  price: z.number().min(0, 'قیمت نمی‌تواند منفی باشد'),
  compare_at_price: z.number().min(0).nullable().optional(),
  cost: z.number().min(0).optional(),
  weight: z.number().min(0).nullable().optional(),
  stock_quantity: z.number().int().min(0).optional(),
  low_stock_threshold: z.number().int().min(0).nullable().optional(),
  is_active: z.boolean().optional(),
  attribute_value_ids: z.array(z.string().uuid()).optional(),
  images: z.array(z.object({
    image_url: z.string(),
    sort_order: z.number().optional(),
  })).optional(),
});

export const updateVariantSchema = z.object({
  sku: z.string().min(1).max(100).optional(),
  barcode: z.string().nullable().optional(),
  price: z.number().min(0).optional(),
  compare_at_price: z.number().min(0).nullable().optional(),
  cost: z.number().min(0).optional(),
  weight: z.number().min(0).nullable().optional(),
  stock_quantity: z.number().int().min(0).optional(),
  low_stock_threshold: z.number().int().min(0).nullable().optional(),
  is_active: z.boolean().optional(),
  attribute_value_ids: z.array(z.string().uuid()).optional(),
});

export const bulkStockSchema = z.object({
  items: z.array(z.object({
    id: z.string().uuid(),
    stock_quantity: z.number().int().min(0),
  })),
});