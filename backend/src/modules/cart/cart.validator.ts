// src/modules/cart/cart.validator.ts
import { z } from 'zod';

export const addToCartSchema = z.object({
  variant_id: z.string().uuid('واریانت نامعتبر است'),
  quantity: z.number().int().min(1, 'حداقل تعداد ۱ است'),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(1, 'حداقل تعداد ۱ است'),
});