// src/modules/blog/hooks/useBlog.ts
'use client';

import { useQuery } from '@tanstack/react-query';
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
