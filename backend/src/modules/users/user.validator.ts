// src/modules/users/user.validator.ts
import { z } from 'zod';
import { UserRole } from '../../shared/constants/enums';

export const userQuerySchema = z.object({
  search: z.string().optional(),
  role: z.nativeEnum(UserRole).optional(),
  is_active: z.enum(['true', 'false']).optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

export const updateRoleSchema = z.object({
  role: z.nativeEnum(UserRole, { required_error: 'نقش الزامی است' }),
});

export const updateStatusSchema = z.object({
  is_active: z.boolean({ required_error: 'وضعیت الزامی است' }),
});
