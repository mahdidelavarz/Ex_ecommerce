// src/modules/variants/services/variant.service.ts
import { apiClient } from '@/lib/api-client';
import type { ApiResponse } from '@/modules/auth/types/auth.type';
import type { ProductVariant } from '../types/variant.types';

export const variantService = {
  /**
   * List variants for a product
   */
  listByProduct: async (productId: string): Promise<ProductVariant[]> => {
    const response = await apiClient.get<ApiResponse<ProductVariant[]>>(
      `/products/${productId}/variants`
    );
    return response.data.data;
  },

  /**
   * Get single variant
   */
  getById: async (variantId: string): Promise<ProductVariant> => {
    const response = await apiClient.get<ApiResponse<ProductVariant>>(
      `/products/variants/${variantId}`
    );
    return response.data.data;
  },

  /**
   * Create variant (admin)
   */
  create: async (productId: string, data: any): Promise<ProductVariant> => {
    const response = await apiClient.post<ApiResponse<ProductVariant>>(
      `/products/${productId}/variants`,
      data
    );
    return response.data.data;
  },

  /**
   * Update variant (admin)
   */
  update: async (variantId: string, data: any): Promise<ProductVariant> => {
    const response = await apiClient.patch<ApiResponse<ProductVariant>>(
      `/products/variants/${variantId}`,
      data
    );
    return response.data.data;
  },

  /**
   * Delete variant (admin)
   */
  delete: async (variantId: string): Promise<void> => {
    await apiClient.delete(`/products/variants/${variantId}`);
  },

  /**
   * Bulk update stock (admin)
   */
  bulkStock: async (items: { id: string; stock_quantity: number }[]): Promise<void> => {
    await apiClient.patch('/products/variants/stock', { items });
  },

  /**
   * Add variant image (admin)
   */
  addImage: async (variantId: string, data: { image_url: string; sort_order?: number }): Promise<any> => {
    const response = await apiClient.post(`/products/variants/${variantId}/images`, data);
    return response.data.data;
  },

  /**
   * Delete variant image (admin)
   */
  deleteImage: async (imageId: string): Promise<void> => {
    await apiClient.delete(`/products/variants/images/${imageId}`);
  },
};