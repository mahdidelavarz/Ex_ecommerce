// src/modules/returns/return.validator.ts
import { z } from 'zod';

export const createReturnSchema = z.object({
  order_id: z.string().uuid({ message: 'شناسه سفارش نامعتبر است' }),
  reason: z.string().min(10, 'دلیل بازگشت باید حداقل ۱۰ کاراکتر باشد').max(500),
  items: z.array(z.object({
    order_item_id: z.string().uuid(),
    quantity: z.number().int().min(1, 'تعداد باید حداقل ۱ باشد'),
  })).min(1, 'حداقل یک آیتم الزامی است'),
});

export const updateReturnStatusSchema = z.object({
  status: z.enum(['approved', 'rejected', 'received', 'refunded']),
  admin_note: z.string().max(500).optional(),
  refund_amount: z.number().nonnegative().optional(),
});

export const returnIdParamSchema = z.object({
  id: z.string().uuid('شناسه نامعتبر است'),
});
