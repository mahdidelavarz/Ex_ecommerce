// src/modules/orders/services/order.service.ts
import { apiClient } from '@/lib/api-client';
import type { ApiResponse } from '@/modules/auth/types/auth.type';
import type { Order, OrderSummary } from '../types/order.types';

export const orderService = {
  create: async (data: {
    shipping_address_id: string;
    billing_address_id: string;
    coupon_code?: string;
    customer_note?: string;
  }): Promise<Order> => {
    const r = await apiClient.post<ApiResponse<Order>>('/orders', data);
    return r.data.data;
  },

  myOrders: async (params?: { page?: number; limit?: number; status?: string }) => {
    const r = await apiClient.get<ApiResponse<OrderSummary[]> & { meta: any }>('/orders', { params });
    return { data: r.data.data, meta: r.data.meta };
  },

  getById: async (id: string): Promise<Order> => {
    const r = await apiClient.get<ApiResponse<Order>>(`/orders/${id}`);
    return r.data.data;
  },

  cancel: async (id: string): Promise<Order> => {
    const r = await apiClient.post<ApiResponse<Order>>(`/orders/${id}/cancel`);
    return r.data.data;
  },

  // Admin
  adminList: async (params?: any) => {
    const r = await apiClient.get<ApiResponse<any[]> & { meta: any }>('/orders/admin/all', { params });
    return { data: r.data.data, meta: r.data.meta };
  },

  updateStatus: async (id: string, data: any): Promise<Order> => {
    const r = await apiClient.patch<ApiResponse<Order>>(`/orders/${id}/status`, data);
    return r.data.data;
  },
};