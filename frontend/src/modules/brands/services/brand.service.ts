// src/modules/brands/services/brand.service.ts
import { apiClient } from '@/lib/api-client';
import {
  BRAND_REVALIDATE_PATHS,
  BRAND_REVALIDATE_TAGS,
  revalidateStorefront,
} from '@/lib/cache-revalidation';
import type { ApiResponse } from '@/modules/auth/types/auth.type';
import type { Brand, BrandMinimal, BrandsResponse } from '../types/brand.types';

export type CreateBrandInput = {
  name: string;
  logo?: string | null;
  description?: string | null;
  is_active?: boolean;
};

async function revalidateBrandData() {
  await revalidateStorefront(BRAND_REVALIDATE_PATHS, BRAND_REVALIDATE_TAGS);
}

export const brandService = {
  /**
   * List brands with optional filters
   */
  list: async (params?: {
    search?: string;
    is_active?: boolean;
    page?: number;
    limit?: number;
  }): Promise<BrandsResponse> => {
    const response = await apiClient.get<
      ApiResponse<Brand[]> & { meta: BrandsResponse['meta'] }
    >('/brands', { params });
    return {
      data: response.data.data,
      meta: response.data.meta,
    };
  },

  /**
   * Get all brands minimal (for dropdowns)
   */
  all: async (): Promise<BrandMinimal[]> => {
    const response = await apiClient.get<ApiResponse<BrandMinimal[]>>('/brands/all');
    return response.data.data;
  },

  /**
   * Get brand by id or slug
   */
  getBySlug: async (slug: string): Promise<Brand> => {
    const response = await apiClient.get<ApiResponse<Brand>>(`/brands/${slug}`);
    return response.data.data;
  },

  /**
   * Create brand (admin)
   */
  create: async (data: CreateBrandInput): Promise<Brand> => {
    const response = await apiClient.post<ApiResponse<Brand>>('/brands', data);
    await revalidateBrandData();
    return response.data.data;
  },

  /**
   * Update brand (admin)
   */
  update: async (id: string, data: Partial<Brand>): Promise<Brand> => {
    const response = await apiClient.patch<ApiResponse<Brand>>(`/brands/${id}`, data);
    await revalidateBrandData();
    return response.data.data;
  },

  /**
   * Delete brand (admin)
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/brands/${id}`);
    await revalidateBrandData();
  },
};
