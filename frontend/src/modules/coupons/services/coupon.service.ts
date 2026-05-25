// src/modules/coupons/services/coupon.service.ts
import { apiClient } from '@/lib/api-client';
import type { ApiResponse } from '@/modules/auth/types/auth.type';
import type { Coupon, CouponValidation } from '../types/coupon.types';

export const couponService = {
  list: async (params?: any) => {
    const r = await apiClient.get<ApiResponse<Coupon[]> & { meta: any }>('/coupons', { params });
    return { data: r.data.data, meta: r.data.meta };
  },

  getById: async (id: string): Promise<Coupon> => {
    const r = await apiClient.get<ApiResponse<Coupon>>(`/coupons/${id}`);
    return r.data.data;
  },

  create: async (data: any): Promise<Coupon> => {
    const r = await apiClient.post<ApiResponse<Coupon>>('/coupons', data);
    return r.data.data;
  },

  update: async (id: string, data: any): Promise<Coupon> => {
    const r = await apiClient.patch<ApiResponse<Coupon>>(`/coupons/${id}`, data);
    return r.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/coupons/${id}`);
  },

  validate: async (data: { code: string; cart_total: number; product_ids: string[] }): Promise<CouponValidation> => {
    const r = await apiClient.post<ApiResponse<CouponValidation>>('/coupons/validate', data);
    return r.data.data;
  },
};