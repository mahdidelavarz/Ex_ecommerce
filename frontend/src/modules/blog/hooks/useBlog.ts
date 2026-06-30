// src/modules/blog/hooks/useBlog.ts
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { blogService } from '../services/blog.service';
import type { BlogPostListItem } from '../types/blog.types';

type ListResult = { data: BlogPostListItem[]; meta: any };

/** Public list (published only). */
export function useBlogPosts(
  params?: Record<string, any>,
  options?: { initialData?: ListResult },
) {
  return useQuery({
    queryKey: ['blog-posts', params],
    queryFn: () => blogService.list(params),
    staleTime: 2 * 60 * 1000,
    initialData: options?.initialData,
  });
}

/** Admin list (incl. drafts). */
export function useAdminBlogPosts(params?: Record<string, any>) {
  return useQuery({
    queryKey: ['blog-posts', 'admin', params],
    queryFn: () => blogService.adminList(params),
    staleTime: 60 * 1000,
  });
}

/** Public detail by slug. */
export function useBlogPost(slug: string) {
  return useQuery({
    queryKey: ['blog-posts', slug],
    queryFn: () => blogService.getBySlug(slug),
    enabled: !!slug,
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateBlogPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => blogService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      toast.success('مطلب ایجاد شد');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'خطا در ایجاد مطلب'),
  });
}

export function useUpdateBlogPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      blogService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      toast.success('مطلب بروزرسانی شد');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'خطا در بروزرسانی مطلب'),
  });
}

export function useDeleteBlogPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => blogService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      toast.success('مطلب حذف شد');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'خطا در حذف مطلب'),
  });
}
