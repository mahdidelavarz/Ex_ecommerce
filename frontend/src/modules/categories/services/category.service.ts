// src/modules/categories/services/category.service.ts
import { apiClient } from '@/lib/api-client';
import type { ApiResponse } from '@/modules/auth/types/auth.type';
import type {
  Category,
  CategoryDetail,
  CategoryTreeNode,
  CategoriesResponse,
} from '../types/category.types';

type RevalidatePath = string | { path: string; type?: 'page' | 'layout' };

const CATEGORY_REVALIDATE_PATHS: RevalidatePath[] = [
  '/',
  '/products',
  '/sitemap.xml',
  { path: '/categories/[slug]', type: 'page' },
];

async function revalidateCategories(): Promise<void> {
  try {
    await fetch('/api/revalidate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paths: CATEGORY_REVALIDATE_PATHS }),
    });
  } catch {
    /* ignore */
  }
}

export const categoryService = {
  /**
   * List categories with optional filters
   */
  list: async (params?: {
    parent_id?: string | null;
    is_active?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<CategoriesResponse> => {
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
   * Get category by id or slug
   */
  getBySlug: async (slug: string): Promise<CategoryDetail> => {
    const response = await apiClient.get<ApiResponse<CategoryDetail>>(
      `/categories/${slug}`
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
   * Create category (admin)
   */
  create: async (data: Partial<Category>): Promise<Category> => {
    const response = await apiClient.post<ApiResponse<Category>>('/categories', data);
    await revalidateCategories();
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
    await revalidateCategories();
    return response.data.data;
  },

  /**
   * Delete category (admin)
   */
  delete: async (id: string, force?: boolean): Promise<void> => {
    await apiClient.delete(`/categories/${id}`, {
      params: { force: force ? 'true' : 'false' },
    });
    await revalidateCategories();
  },

  /**
   * Bulk sort categories (admin)
   */
  bulkSort: async (items: Array<{ id: string; sort_order: number }>): Promise<void> => {
    await apiClient.patch('/categories/sort', { items });
    await revalidateCategories();
  },
};
