// src/modules/blog/services/blog.service.ts
import { apiClient } from '@/lib/api-client';
import { revalidateStorefront } from '@/lib/cache-revalidation';
import type { ApiResponse } from '@/modules/auth/types/auth.type';
import type { BlogPostListItem, BlogPostDetail } from '../types/blog.types';

type PageMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};
type QueryParams = Record<string, string | number | boolean | null | undefined>;
type BlogPostPayload = Record<string, unknown>;
type ListResult = { data: BlogPostListItem[]; meta: PageMeta };

async function revalidateBlogData() {
  await revalidateStorefront('blog');
}

export const blogService = {
  /** Upload a cover image (admin). Returns the absolute URL to store. */
  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<ApiResponse<{ url: string }>>(
      '/uploads',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return response.data.data.url;
  },

  /** Public list (published only). */
  list: async (params?: QueryParams): Promise<ListResult> => {
    const response = await apiClient.get<ApiResponse<BlogPostListItem[]> & { meta: PageMeta }>(
      '/blog-posts',
      { params },
    );
    return { data: response.data.data, meta: response.data.meta };
  },

  /** Admin list (incl. drafts). */
  adminList: async (params?: QueryParams): Promise<ListResult> => {
    const response = await apiClient.get<ApiResponse<BlogPostListItem[]> & { meta: PageMeta }>(
      '/blog-posts/admin',
      { params },
    );
    return { data: response.data.data, meta: response.data.meta };
  },

  /** Public detail by slug (+ related, increments views). */
  getBySlug: async (slug: string): Promise<BlogPostDetail> => {
    const response = await apiClient.get<ApiResponse<BlogPostDetail>>(`/blog-posts/${slug}`);
    return response.data.data;
  },

  /** Admin single post by id (incl. drafts, for the edit form). */
  getByIdAdmin: async (id: string): Promise<BlogPostDetail> => {
    const response = await apiClient.get<ApiResponse<BlogPostDetail>>(`/blog-posts/admin/${id}`);
    return response.data.data;
  },

  /** Create (admin). */
  create: async (data: BlogPostPayload): Promise<BlogPostDetail> => {
    const response = await apiClient.post<ApiResponse<BlogPostDetail>>('/blog-posts', data);
    await revalidateBlogData();
    return response.data.data;
  },

  /** Update (admin). */
  update: async (id: string, data: BlogPostPayload): Promise<BlogPostDetail> => {
    const response = await apiClient.patch<ApiResponse<BlogPostDetail>>(`/blog-posts/${id}`, data);
    await revalidateBlogData();
    return response.data.data;
  },

  /** Soft delete (admin). */
  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/blog-posts/${id}`);
    await revalidateBlogData();
  },
};
