// src/modules/categories/services/category.service.ts
import { apiClient } from '@/lib/api-client';
import { revalidateStorefront } from '@/lib/cache-revalidation';
import { normalizeUploadUrl } from '@/utils/imageUrl';
import type { ApiResponse } from '@/modules/auth/types/auth.type';
import type {
  Category,
  CategoryDetail,
  CategoryTreeNode,
  CategoriesResponse,
} from '../types/category.types';

type CategoryListParams = {
  parent_id?: string | null;
  is_active?: boolean;
  has_image?: boolean;
  search?: string;
  page?: number;
  limit?: number;
};

async function revalidateCategoryData() {
  await revalidateStorefront('categories');
}

export const categoryService = {
  /**
   * Upload an image file (admin). Store local uploads as same-origin paths so
   * previews work from localhost, LAN devices, and Docker-backed environments.
   */
  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<ApiResponse<{ url: string }>>(
      '/uploads',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return normalizeUploadUrl(response.data.data.url) ?? response.data.data.url;
  },

  /**
   * List categories with optional filters
   */
  list: async (params?: CategoryListParams): Promise<CategoriesResponse> => {
    const response = await apiClient.get<
      ApiResponse<Category[]> & { meta: CategoriesResponse['meta'] }
    >(
      '/categories',
      { params }
    );
    return {
      data: response.data.data,
      meta: response.data.meta,
    };
  },

  /**
   * Admin list categories, including inactive categories.
   */
  adminList: async (params?: CategoryListParams): Promise<CategoriesResponse> => {
    const response = await apiClient.get<
      ApiResponse<Category[]> & { meta: CategoriesResponse['meta'] }
    >(
      '/categories/admin',
      { params }
    );
    return {
      data: response.data.data,
      meta: response.data.meta,
    };
  },

  /**
   * Get category by id or slug
   */
  getBySlug: async (slug: string): Promise<CategoryDetail> => {
    const response = await apiClient.get<ApiResponse<CategoryDetail>>(
      `/categories/${slug}`
    );
    return response.data.data;
  },

  /**
   * Get category by id for admin edit screens, including inactive categories.
   */
  getByIdAdmin: async (id: string): Promise<CategoryDetail> => {
    const response = await apiClient.get<ApiResponse<CategoryDetail>>(
      `/categories/admin/${id}`
    );
    return response.data.data;
  },

  /**
   * Get full category tree
   */
  getTree: async (): Promise<CategoryTreeNode[]> => {
    const response = await apiClient.get<ApiResponse<CategoryTreeNode[]>>(
      '/categories/tree'
    );
    return response.data.data;
  },

  /**
   * Get full category tree for admin screens, including inactive categories.
   */
  getAdminTree: async (): Promise<CategoryTreeNode[]> => {
    const response = await apiClient.get<ApiResponse<CategoryTreeNode[]>>(
      '/categories/admin/tree'
    );
    return response.data.data;
  },

  /**
   * Create category (admin)
   */
  create: async (data: Partial<Category>): Promise<Category> => {
    const response = await apiClient.post<ApiResponse<Category>>('/categories', data);
    await revalidateCategoryData();
    return response.data.data;
  },

  /**
   * Update category (admin)
   */
  update: async (id: string, data: Partial<Category>): Promise<Category> => {
    const response = await apiClient.patch<ApiResponse<Category>>(
      `/categories/${id}`,
      data
    );
    await revalidateCategoryData();
    return response.data.data;
  },

  /**
   * Delete category (admin)
   */
  delete: async (id: string, force?: boolean): Promise<void> => {
    await apiClient.delete(`/categories/${id}`, {
      params: { force: force ? 'true' : 'false' },
    });
    await revalidateCategoryData();
  },

  /**
   * Bulk sort categories (admin)
   */
  bulkSort: async (items: Array<{ id: string; sort_order: number }>): Promise<void> => {
    await apiClient.patch('/categories/sort', { items });
    await revalidateCategoryData();
  },
};
