// src/modules/payments/services/payment.service.ts
import { apiClient } from '@/lib/api-client';
import type { ApiResponse } from '@/modules/auth/types/auth.type';
import type { Payment, InitiatePaymentResponse } from '../types/payment.types';

export const paymentService = {
  findByOrder: async (orderId: string): Promise<Payment[]> => {
    const r = await apiClient.get<ApiResponse<Payment[]>>(`/payments/order/${orderId}`);
    return r.data.data;
  },
  getById: async (id: string): Promise<Payment> => {
    const r = await apiClient.get<ApiResponse<Payment>>(`/payments/${id}`);
    return r.data.data;
  },
  initiate: async (orderId: string): Promise<InitiatePaymentResponse> => {
    const r = await apiClient.post<ApiResponse<InitiatePaymentResponse>>('/payments/initiate', { order_id: orderId });
    return r.data.data;
  },
  create: async (data: { order_id: string; provider: string; method: string; amount: number }): Promise<Payment> => {
    const r = await apiClient.post<ApiResponse<Payment>>('/payments', data);
    return r.data.data;
  },
  update: async (id: string, data: { status?: string; transaction_id?: string; gateway_response?: object; paid_at?: string; refund_amount?: number }): Promise<Payment> => {
    const r = await apiClient.patch<ApiResponse<Payment>>(`/payments/${id}`, data);
    return r.data.data;
  },
};
