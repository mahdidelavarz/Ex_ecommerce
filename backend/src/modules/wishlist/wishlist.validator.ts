// src/modules/wishlist/wishlist.validator.ts
import { z } from 'zod';

export const addToWishlistSchema = z.object({
  variant_id: z.string().uuid('واریانت نامعتبر است'),
});

export const wishlistIdParamSchema = z.object({
  id: z.string().uuid('شناسه نامعتبر است'),
});

export const variantIdParamSchema = z.object({
  variantId: z.string().uuid('شناسه واریانت نامعتبر است'),
});