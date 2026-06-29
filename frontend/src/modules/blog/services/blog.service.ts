// src/modules/blog/services/blog.service.ts
import { apiClient } from '@/lib/api-client';
import type { ApiResponse } from '@/modules/auth/types/auth.type';
import type { BlogPostListItem, BlogPostDetail } from '../types/blog.types';

type ListResult = { data: BlogPostListItem[]; meta: any };

/**
 * Ask Next to drop the cached blog pages so a freshly created/updated/deleted
 * post shows on the public `/blog` pages immediately. Fire-and-forget: a failed
 * revalidation should never block the admin action.
 */
async function revalidateBlog(): Promise<void> {
  try {
    await fetch("/api/revalidate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        paths: ["/blog", { path: "/blog/[slug]", type: "page" }],
      }),
    });
  } catch {
    /* ignore */
  }
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
  list: async (params?: Record<string, any>): Promise<ListResult> => {
    const response = await apiClient.get<ApiResponse<BlogPostListItem[]> & { meta: any }>(
      '/blog-posts',
      { params },
    );
    return { data: response.data.data, meta: response.data.meta };
  },

  /** Admin list (incl. drafts). */
  adminList: async (params?: Record<string, any>): Promise<ListResult> => {
    const response = await apiClient.get<ApiResponse<BlogPostListItem[]> & { meta: any }>(
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
  create: async (data: any): Promise<BlogPostDetail> => {
    const response = await apiClient.post<ApiResponse<BlogPostDetail>>('/blog-posts', data);
    await revalidateBlog();
    return response.data.data;
  },

  /** Update (admin). */
  update: async (id: string, data: any): Promise<BlogPostDetail> => {
    const response = await apiClient.patch<ApiResponse<BlogPostDetail>>(`/blog-posts/${id}`, data);
    await revalidateBlog();
    return response.data.data;
  },

  /** Soft delete (admin). */
  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/blog-posts/${id}`);
    await revalidateBlog();
  },
};
