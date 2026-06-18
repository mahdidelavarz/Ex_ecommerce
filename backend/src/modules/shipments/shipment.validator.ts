// src/modules/shipments/shipment.validator.ts
import { z } from 'zod';

export const createShipmentSchema = z.object({
  order_id:               z.string().uuid({ message: 'شناسه سفارش نامعتبر است' }),
  courier_name:           z.string().min(1, 'نام پیک الزامی است'),
  tracking_number:        z.string().min(1, 'کد رهگیری الزامی است'),
  tracking_url:           z.string().url().optional(),
  estimated_delivery_at:  z.string().datetime().optional(),
  notes:                  z.string().optional(),
});

export const updateShipmentSchema = z.object({
  status: z.enum([
    'pending', 'processing', 'shipped', 'in_transit',
    'out_for_delivery', 'delivered', 'failed', 'returned',
  ]).optional(),
  tracking_number: z.string().min(1).optional(),
  tracking_url:    z.string().url().optional(),
  shipped_at:      z.string().datetime().optional(),
  delivered_at:    z.string().datetime().optional(),
  notes:           z.string().optional(),
});
