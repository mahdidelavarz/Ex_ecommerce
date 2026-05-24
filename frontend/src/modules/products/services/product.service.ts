// src/modules/products/services/product.service.ts
import { apiClient } from '@/lib/api-client';
import type { ApiResponse } from '@/modules/auth/types/auth.type';
import type {
  ProductListResponse,
  ProductDetail,
  ProductFilters,
} from '../types/product.types';

export const productService = {
  /**
   * List products with filters
   */
  list: async (params?: Record<string, any>): Promise<{
    data: ProductListResponse[];
    meta: any;
  }> => {
    const response = await apiClient.get<ApiResponse<ProductListResponse[]> & { meta: any }>(
      '/products',
      { params }
    );
    return {
      data: response.data.data,
      meta: response.data.meta,
    };
  },

  /**
   * Get single product by slug
   */
  getBySlug: async (slug: string): Promise<ProductDetail> => {
    const response = await apiClient.get<ApiResponse<ProductDetail>>(`/products/${slug}`);
    return response.data.data;
  },

  /**
   * Get related products
   */
  getRelated: async (slug: string, limit?: number): Promise<ProductListResponse[]> => {
    const response = await apiClient.get<ApiResponse<ProductListResponse[]>>(
      `/products/${slug}/related`,
      { params: { limit } }
    );
    return response.data.data;
  },

  /**
   * Get product filters for category
   */
  getFilters: async (categoryId: string): Promise<ProductFilters> => {
    const response = await apiClient.get<ApiResponse<ProductFilters>>('/products/filters', {
      params: { category_id: categoryId },
    });
    return response.data.data;
  },

  /**
   * Create product (admin)
   */
  create: async (data: any): Promise<ProductDetail> => {
    const response = await apiClient.post<ApiResponse<ProductDetail>>('/products', data);
    return response.data.data;
  },

  /**
   * Update product (admin)
   */
  update: async (id: string, data: any): Promise<ProductDetail> => {
    const response = await apiClient.patch<ApiResponse<ProductDetail>>(`/products/${id}`, data);
    return response.data.data;
  },

  /**
   * Delete product (admin - soft delete)
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/products/${id}`);
  },

  /**
   * Bulk status update (admin)
   */
  bulkStatus: async (ids: string[], is_active: boolean): Promise<void> => {
    await apiClient.patch('/products/bulk-status', { ids, is_active });
  },

  /**
   * Add product image (admin)
   */
  addImage: async (productId: string, data: any): Promise<any> => {
    const response = await apiClient.post(`/products/${productId}/images`, data);
    return response.data.data;
  },

  /**
   * Delete product image (admin)
   */
  deleteImage: async (productId: string, imageId: string): Promise<void> => {
    await apiClient.delete(`/products/${productId}/images/${imageId}`);
  },

  /**
   * Sync product tags (admin)
   */
  syncTags: async (productId: string, tag_ids: string[]): Promise<void> => {
    await apiClient.post(`/products/${productId}/tags`, { tag_ids });
  },
};