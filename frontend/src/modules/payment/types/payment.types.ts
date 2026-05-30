// src/modules/payments/types/payment.types.ts
export interface Payment {
  id: string;
  order_id: string;
  provider: string;
  method: string;
  transaction_id: string | null;
  amount: number;
  currency_code: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'partially_refunded' | 'cancelled';
  gateway_response: any;
  paid_at: string | null;
  refunded_at: string | null;
  refund_amount: number | null;
  created_at: string;
  updated_at: string;
}