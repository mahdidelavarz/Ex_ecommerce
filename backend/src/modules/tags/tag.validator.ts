// src/modules/tags/tag.validator.ts
import { z } from 'zod';

export const createTagSchema = z.object({
  name: z.string().min(1, 'نام تگ الزامی است').max(100),
});

export const updateTagSchema = z.object({
  name: z.string().min(1).max(100).optional(),
});

export const tagQuerySchema = z.object({
  search: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});