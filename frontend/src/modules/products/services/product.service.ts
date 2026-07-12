// src/modules/products/services/product.service.ts
import { apiClient } from '@/lib/api-client';
import {
  PRODUCT_REVALIDATE_PATHS,
  PRODUCT_REVALIDATE_TAGS,
  revalidateStorefront,
} from '@/lib/cache-revalidation';
import type { ApiResponse } from '@/modules/auth/types/auth.type';
import type {
  ProductListResponse,
  ProductDetail,
  ProductFilters,
} from '../types/product.types';

export type PageMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
};

export type ProductListParams = Record<
  string,
  string | number | boolean | null | undefined
>;
export type ProductMutationPayload = Record<string, unknown>;
export type ProductListResult = {
  data: ProductListResponse[];
  meta: PageMeta | null;
};

async function revalidateProductData() {
  await revalidateStorefront(PRODUCT_REVALIDATE_PATHS, PRODUCT_REVALIDATE_TAGS);
}

export const productService = {
  /**
   * Upload an image file (admin). Returns the absolute URL to store as image_url.
   */
  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<ApiResponse<{ url: string }>>(
      '/uploads',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data.data.url;
  },

  /**
   * List products with filters
   */
  list: async (params?: ProductListParams): Promise<ProductListResult> => {
    const response = await apiClient.get<
      ApiResponse<ProductListResponse[]> & { meta: PageMeta }
    >(
      '/products',
      { params }
    );
    return {
      data: response.data.data,
      meta: response.data.meta,
    };
  },

  /**
   * Get single product by id
   */
  getById: async (id: string): Promise<ProductDetail> => {
    const response = await apiClient.get<ApiResponse<ProductDetail>>(`/products/id/${id}`);
    return response.data.data;
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
  create: async (data: ProductMutationPayload): Promise<ProductDetail> => {
    const response = await apiClient.post<ApiResponse<ProductDetail>>('/products', data);
    await revalidateProductData();
    return response.data.data;
  },

  /**
   * Update product (admin)
   */
  update: async (id: string, data: ProductMutationPayload): Promise<ProductDetail> => {
    const response = await apiClient.patch<ApiResponse<ProductDetail>>(`/products/${id}`, data);
    await revalidateProductData();
    return response.data.data;
  },

  /**
   * Delete product (admin - soft delete)
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/products/${id}`);
    await revalidateProductData();
  },

  /**
   * Bulk status update (admin)
   */
  bulkStatus: async (ids: string[], is_active: boolean): Promise<void> => {
    await apiClient.patch('/products/bulk-status', { ids, is_active });
    await revalidateProductData();
  },

  /**
   * Add product image (admin)
   */
  addImage: async (
    productId: string,
    data: ProductMutationPayload,
  ): Promise<unknown> => {
    const response = await apiClient.post(`/products/${productId}/images`, data);
    await revalidateProductData();
    return response.data.data;
  },

  /**
   * Delete product image (admin)
   */
  deleteImage: async (productId: string, imageId: string): Promise<void> => {
    await apiClient.delete(`/products/${productId}/images/${imageId}`);
    await revalidateProductData();
  },

  /**
   * Sync product tags (admin)
   */
  syncTags: async (productId: string, tag_ids: string[]): Promise<void> => {
    await apiClient.post(`/products/${productId}/tags`, { tag_ids });
    await revalidateProductData();
  },
};
