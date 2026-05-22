// src/modules/categories/hooks/useCategories.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import { categoryService } from '../services/category.service';

export function useCategories(params?: {
  parent_id?: string | null;
  is_active?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['categories', params],
    queryFn: () => categoryService.list(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCategoryTree() {
  return useQuery({
    queryKey: ['categories', 'tree'],
    queryFn: () => categoryService.getTree(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useCategory(slug: string) {
  return useQuery({
    queryKey: ['categories', slug],
    queryFn: () => categoryService.getBySlug(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
}