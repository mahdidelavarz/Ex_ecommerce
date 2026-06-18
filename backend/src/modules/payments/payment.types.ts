// src/modules/payments/payment.types.ts
export interface GatewayResponse {
  authority?: string;
  ref_id?: string;
  [key: string]: unknown;
}

export interface PaymentResponse {
  id: string;
  order_id: string;
  provider: string;
  method: string;
  transaction_id: string | null;
  amount: number;
  currency_code: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'partially_refunded' | 'cancelled';
  gateway_response: GatewayResponse | null;
  paid_at: string | null;
  refunded_at: string | null;
  refund_amount: number | null;
  created_at: string;
  updated_at: string;
}

export interface CreatePaymentDto {
  order_id: string;
  provider: string;
  method: string;
  amount: number;
  transaction_id?: string;
}

export interface UpdatePaymentDto {
  status?: string;
  transaction_id?: string;
  gateway_response?: GatewayResponse;
  paid_at?: string;
  refund_amount?: number;
  amount?: number;
}

export interface InitiatePaymentDto {
  order_id: string;
}

export interface InitiatePaymentResponse {
  gateway_url: string;
}
