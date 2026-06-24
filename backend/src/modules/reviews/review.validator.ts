// src/modules/reviews/review.validator.ts
import { z } from 'zod';

export const createReviewSchema = z.object({
  product_id: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().min(1, 'عنوان نمی‌تواند خالی باشد').max(200).optional(),
  comment: z.string().trim().min(1, 'متن نظر نمی‌تواند خالی باشد').max(2000).optional(),
});

export const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  title: z.string().trim().min(1, 'عنوان نمی‌تواند خالی باشد').max(200).optional(),
  comment: z.string().trim().min(1, 'متن نظر نمی‌تواند خالی باشد').max(2000).optional(),
});

export const approveReviewSchema = z.object({
  is_approved: z.boolean({ required_error: 'وضعیت تایید الزامی است' }),
});

export const replyReviewSchema = z.object({
  admin_reply: z.string().min(1, 'پاسخ نمی‌تواند خالی باشد').max(1000),
});

export const reviewQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  sort_by: z.enum(['newest', 'helpful', 'rating_high', 'rating_low']).optional(),
});
