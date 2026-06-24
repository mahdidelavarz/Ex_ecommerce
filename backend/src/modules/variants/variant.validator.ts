// src/modules/variants/variant.validator.ts
import { z } from 'zod';

const priceRefinement = (data: any, ctx: z.RefinementCtx) => {
  if (data.compare_at_price != null && data.price != null && data.compare_at_price <= data.price) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'قیمت مقایسه باید بزرگ‌تر از قیمت فروش باشد',
      path: ['compare_at_price'],
    });
  }
  if (data.cost != null && data.price != null && data.cost > data.price) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'قیمت تمام شده نباید از قیمت فروش بیشتر باشد',
      path: ['cost'],
    });
  }
};

// numeric columns come back from Postgres as strings (TypeORM numeric), so the
// admin edit form can submit string values — coerce them to numbers here.
export const createVariantSchema = z.object({
  sku: z.string().min(1, 'کد محصول الزامی است').max(100),
  barcode: z.string().nullable().optional(),
  price: z.coerce.number().min(0, 'قیمت نمی‌تواند منفی باشد'),
  compare_at_price: z.coerce.number().min(0).nullable().optional(),
  cost: z.coerce.number().min(0).optional(),
  weight: z.coerce.number().min(0).nullable().optional(),
  stock_quantity: z.coerce.number().int().min(0).optional(),
  low_stock_threshold: z.coerce.number().int().min(0).nullable().optional(),
  is_active: z.boolean().optional(),
  attribute_value_ids: z.array(z.string().uuid()).optional(),
  images: z.array(z.object({
    image_url: z.string().url('آدرس تصویر نامعتبر است'),
    sort_order: z.coerce.number().optional(),
  })).optional(),
}).superRefine(priceRefinement);

export const updateVariantSchema = z.object({
  sku: z.string().min(1).max(100).optional(),
  barcode: z.string().nullable().optional(),
  price: z.coerce.number().min(0).optional(),
  compare_at_price: z.coerce.number().min(0).nullable().optional(),
  cost: z.coerce.number().min(0).optional(),
  weight: z.coerce.number().min(0).nullable().optional(),
  stock_quantity: z.coerce.number().int().min(0).optional(),
  low_stock_threshold: z.coerce.number().int().min(0).nullable().optional(),
  is_active: z.boolean().optional(),
  attribute_value_ids: z.array(z.string().uuid()).optional(),
}).superRefine(priceRefinement);

export const bulkStockSchema = z.object({
  items: z.array(z.object({
    id: z.string().uuid(),
    stock_quantity: z.number().int().min(0),
  })),
});