// src/modules/reviews/services/review.service.ts
import { apiClient } from '@/lib/api-client';
import type { ApiResponse } from '@/modules/auth/types/auth.type';
import type { Review } from '../types/review.types';

export const reviewService = {
  getProductReviews: async (productId: string, params?: { page?: number; limit?: number; sort_by?: string }) => {
    const r = await apiClient.get<ApiResponse<Review[]> & { meta: any }>(`/reviews/product/${productId}`, { params });
    return {
      reviews: r.data.data,
      meta: r.data.meta,
    };
  },

  create: async (data: { product_id: string; rating: number; title?: string; comment?: string }): Promise<Review> => {
    const r = await apiClient.post<ApiResponse<Review>>('/reviews', data);
    return r.data.data;
  },

  update: async (id: string, data: { rating?: number; title?: string; comment?: string }): Promise<Review> => {
    const r = await apiClient.patch<ApiResponse<Review>>(`/reviews/${id}`, data);
    return r.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/reviews/${id}`);
  },

  markHelpful: async (id: string): Promise<{ helpful_count: number }> => {
    const r = await apiClient.post<ApiResponse<{ helpful_count: number }>>(`/reviews/${id}/helpful`);
    return r.data.data;
  },

  // Admin
  adminList: async (params?: any) => {
    const r = await apiClient.get<ApiResponse<Review[]> & { meta: any }>('/reviews/admin/all', { params });
    return { data: r.data.data, meta: r.data.meta };
  },

  approve: async (id: string, is_approved: boolean): Promise<Review> => {
    const r = await apiClient.patch<ApiResponse<Review>>(`/reviews/${id}/approve`, { is_approved });
    return r.data.data;
  },

  reply: async (id: string, admin_reply: string): Promise<Review> => {
    const r = await apiClient.post<ApiResponse<Review>>(`/reviews/${id}/reply`, { admin_reply });
    return r.data.data;
  },
};