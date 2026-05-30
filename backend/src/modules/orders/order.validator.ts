// src/modules/orders/order.validator.ts
import { z } from 'zod';

export const createOrderSchema = z.object({
  shipping_address_id: z.string().uuid('آدرس ارسال نامعتبر است'),
  billing_address_id: z.string().uuid('آدرس صورتحساب نامعتبر است'),
  coupon_code: z.string().optional(),
  customer_note: z.string().max(500).optional(),
});

export const updateStatusSchema = z.object({
  order_status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned']).optional(),
  payment_status: z.enum(['pending', 'partially_paid', 'paid', 'refunded', 'failed']).optional(),
  fulfillment_status: z.enum(['unfulfilled', 'partially_fulfilled', 'fulfilled']).optional(),
  admin_note: z.string().optional(),
});

export const orderQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  status: z.string().optional(),
  payment_status: z.string().optional(),
  search: z.string().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
});