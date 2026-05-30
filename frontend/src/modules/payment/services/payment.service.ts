// src/modules/payments/services/payment.service.ts
import { apiClient } from '@/lib/api-client';
import type { ApiResponse } from '@/modules/auth/types/auth.type';
import type { Payment } from '../types/payment.types';

export const paymentService = {
  findByOrder: async (orderId: string): Promise<Payment[]> => {
    const r = await apiClient.get<ApiResponse<Payment[]>>(`/payments/order/${orderId}`);
    return r.data.data;
  },
  getById: async (id: string): Promise<Payment> => {
    const r = await apiClient.get<ApiResponse<Payment>>(`/payments/${id}`);
    return r.data.data;
  },
  create: async (data: any): Promise<Payment> => {
    const r = await apiClient.post<ApiResponse<Payment>>('/payments', data);
    return r.data.data;
  },
  update: async (id: string, data: any): Promise<Payment> => {
    const r = await apiClient.patch<ApiResponse<Payment>>(`/payments/${id}`, data);
    return r.data.data;
  },
};