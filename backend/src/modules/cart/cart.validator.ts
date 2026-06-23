// src/modules/cart/cart.validator.ts
import { z } from 'zod';

export const addToCartSchema = z.object({
  variant_id: z.string().uuid('واریانت نامعتبر است'),
  quantity: z
    .number()
    .int('تعداد باید عدد صحیح باشد')
    .min(1, 'حداقل تعداد ۱ است')
    .max(100, 'حداکثر تعداد مجاز ۱۰۰ است'),
});

export const updateCartItemSchema = z.object({
  quantity: z
    .number()
    .int('تعداد باید عدد صحیح باشد')
    .min(1, 'حداقل تعداد ۱ است')
    .max(100, 'حداکثر تعداد مجاز ۱۰۰ است'),
});