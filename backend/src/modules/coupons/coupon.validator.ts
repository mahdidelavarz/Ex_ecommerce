// src/modules/coupons/coupon.validator.ts
import { z } from 'zod';

// Base schema بدون refine
const couponBaseSchema = z.object({
  code: z.string().min(1, 'کد تخفیف الزامی است').max(50).transform((v) => v.toUpperCase()),
  type: z.enum(['percentage', 'fixed', 'free_shipping']),
  value: z.number().min(0),
  min_order_amount: z.number().min(0).nullable().optional(),
  max_discount: z.number().min(0).nullable().optional(),
  usage_limit: z.number().int().min(1).nullable().optional(),
  usage_per_user: z.number().int().min(1).nullable().optional(),
  starts_at: z.string().min(1),
  expires_at: z.string().min(1),
  is_active: z.boolean().optional(),
  product_ids: z.array(z.string().uuid()).optional(),
  category_ids: z.array(z.string().uuid()).optional(),
});

// Create با validation اضافی
export const createCouponSchema = couponBaseSchema.refine(
  (data) => data.type !== 'percentage' || data.value <= 100,
  { message: 'درصد تخفیف نمی‌تواند بیشتر از ۱۰۰ باشد', path: ['value'] }
);

// Update با همان refine درصد
export const updateCouponSchema = couponBaseSchema.partial().refine(
  (data) => !(data.type === 'percentage' && data.value !== undefined && data.value > 100),
  { message: 'درصد تخفیف نمی‌تواند بیشتر از ۱۰۰ باشد', path: ['value'] },
);

export const validateCouponSchema = z.object({
  code: z.string().min(1).transform((v) => v.toUpperCase()),
  cart_total: z.number().min(0),
  product_ids: z.array(z.string().uuid()),
});

export const couponQuerySchema = z.object({
  search: z.string().optional(),
  is_active: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});