// src/modules/reviews/services/review.service.ts
import { apiClient } from '@/lib/api-client';
import { revalidateStorefront } from '@/lib/cache-revalidation';
import type { ApiResponse } from '@/modules/auth/types/auth.type';
import type { Review, CanReviewResponse } from '../types/review.types';

type PageMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  avg_rating: number;
  rating_distribution: Record<number, number>;
};
type ReviewQueryParams = Record<string, string | number | boolean | undefined>;
type ProductReviewsResult = { reviews: Review[]; meta: PageMeta };
type AdminReviewsResult = { data: Review[]; meta: PageMeta };
type CreateReviewPayload = {
  product_id: string;
  rating: number;
  title?: string;
  comment?: string;
};
type UpdateReviewPayload = {
  rating?: number;
  title?: string;
  comment?: string;
};

async function revalidateProductReviewData() {
  await revalidateStorefront('reviews');
}

export const reviewService = {
  getProductReviews: async (
    productId: string,
    params?: ReviewQueryParams,
  ): Promise<ProductReviewsResult> => {
    const r = await apiClient.get<ApiResponse<Review[]> & { meta: PageMeta }>(
      `/reviews/product/${productId}`,
      { params },
    );
    return { reviews: r.data.data, meta: r.data.meta };
  },

  canReview: async (productId: string): Promise<CanReviewResponse> => {
    const r = await apiClient.get<ApiResponse<CanReviewResponse>>(
      `/reviews/product/${productId}/can-review`,
    );
    return r.data.data;
  },

  create: async (data: CreateReviewPayload): Promise<Review> => {
    const r = await apiClient.post<ApiResponse<Review>>('/reviews', data);
    return r.data.data;
  },

  update: async (id: string, data: UpdateReviewPayload): Promise<Review> => {
    const r = await apiClient.patch<ApiResponse<Review>>(`/reviews/${id}`, data);
    return r.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/reviews/${id}`);
  },

  adminDelete: async (id: string): Promise<void> => {
    await apiClient.delete(`/reviews/admin/${id}`);
    await revalidateProductReviewData();
  },

  markHelpful: async (id: string): Promise<{ helpful_count: number; voted: boolean }> => {
    const r = await apiClient.post<ApiResponse<{ helpful_count: number; voted: boolean }>>(
      `/reviews/${id}/helpful`,
    );
    return r.data.data;
  },

  // Admin
  adminList: async (params?: ReviewQueryParams): Promise<AdminReviewsResult> => {
    const r = await apiClient.get<ApiResponse<Review[]> & { meta: PageMeta }>(
      '/reviews/admin/all',
      { params },
    );
    return { data: r.data.data, meta: r.data.meta };
  },

  approve: async (id: string, is_approved: boolean): Promise<Review> => {
    const r = await apiClient.patch<ApiResponse<Review>>(`/reviews/${id}/approve`, {
      is_approved,
    });
    await revalidateProductReviewData();
    return r.data.data;
  },

  reply: async (id: string, admin_reply: string): Promise<Review> => {
    const r = await apiClient.post<ApiResponse<Review>>(`/reviews/${id}/reply`, {
      admin_reply,
    });
    await revalidateProductReviewData();
    return r.data.data;
  },
};
