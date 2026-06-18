// src/modules/payments/payment.validator.ts
import { z } from 'zod';

const gatewayResponseSchema = z.object({
  authority: z.string().optional(),
  ref_id: z.string().optional(),
}).passthrough().optional();

export const createPaymentSchema = z.object({
  order_id: z.string().uuid(),
  provider: z.string().min(1),
  method: z.string().min(1),
  amount: z.number().min(0),
});

export const updatePaymentSchema = z.object({
  status: z.enum(['pending', 'processing', 'completed', 'failed', 'refunded', 'partially_refunded', 'cancelled']).optional(),
  transaction_id: z.string().optional(),
  gateway_response: gatewayResponseSchema,
  paid_at: z.string().optional(),
  refund_amount: z.number().min(0).optional(),
});

export const initiatePaymentSchema = z.object({
  order_id: z.string().uuid(),
});
