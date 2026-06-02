// src/modules/wishlist/wishlist.validator.ts
import { z } from 'zod';

export const addToWishlistSchema = z.object({
  variant_id: z.string().uuid('واریانت نامعتبر است'),
});