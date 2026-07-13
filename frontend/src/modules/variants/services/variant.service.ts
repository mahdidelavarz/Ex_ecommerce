// src/modules/variants/services/variant.service.ts
import { apiClient } from '@/lib/api-client';
import { revalidateStorefront } from '@/lib/cache-revalidation';
import type { ApiResponse } from '@/modules/auth/types/auth.type';
import type { ProductVariant, VariantImage } from '../types/variant.types';

type VariantMutationPayload = Record<string, unknown>;

async function revalidateProductData() {
  await revalidateStorefront('products');
}

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
  create: async (
    productId: string,
    data: VariantMutationPayload,
  ): Promise<ProductVariant> => {
    const response = await apiClient.post<ApiResponse<ProductVariant>>(
      `/products/${productId}/variants`,
      data
    );
    await revalidateProductData();
    return response.data.data;
  },

  /**
   * Update variant (admin)
   */
  update: async (
    variantId: string,
    data: VariantMutationPayload,
  ): Promise<ProductVariant> => {
    const response = await apiClient.patch<ApiResponse<ProductVariant>>(
      `/products/variants/${variantId}`,
      data
    );
    await revalidateProductData();
    return response.data.data;
  },

  /**
   * Delete variant (admin)
   */
  delete: async (variantId: string): Promise<void> => {
    await apiClient.delete(`/products/variants/${variantId}`);
    await revalidateProductData();
  },

  /**
   * Bulk update stock (admin)
   */
  bulkStock: async (items: { id: string; stock_quantity: number }[]): Promise<void> => {
    await apiClient.patch('/products/variants/stock', { items });
    await revalidateProductData();
  },

  /**
   * Add variant image (admin)
   */
  addImage: async (
    variantId: string,
    data: { image_url: string; sort_order?: number },
  ): Promise<VariantImage> => {
    const response = await apiClient.post<ApiResponse<VariantImage>>(
      `/products/variants/${variantId}/images`,
      data,
    );
    await revalidateProductData();
    return response.data.data;
  },

  /**
   * Delete variant image (admin)
   */
  deleteImage: async (imageId: string): Promise<void> => {
    await apiClient.delete(`/products/variants/images/${imageId}`);
    await revalidateProductData();
  },
};
