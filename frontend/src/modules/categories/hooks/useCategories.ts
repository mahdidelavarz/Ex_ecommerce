// src/modules/categories/hooks/useCategories.ts
'use client';

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import type { QueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { categoryService } from '../services/category.service';
import type { Category } from '../types/category.types';

type ApiError = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

function refreshCategoryQueries(queryClient: QueryClient) {
  return queryClient.invalidateQueries({
    queryKey: ['categories'],
    refetchType: 'active',
  });
}

function errorMessage(error: ApiError, fallback: string) {
  return error.response?.data?.message || fallback;
}

export function useCategories(params?: {
  parent_id?: string | null;
  is_active?: boolean;
  has_image?: boolean;
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

export function useAdminCategories(params?: {
  parent_id?: string | null;
  is_active?: boolean;
  has_image?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['categories', 'admin', params],
    queryFn: () => categoryService.adminList(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCategoryTree() {
  return useQuery({
    queryKey: ['categories', 'tree'],
    queryFn: () => categoryService.getTree(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useAdminCategoryTree() {
  return useQuery({
    queryKey: ['categories', 'admin', 'tree'],
    queryFn: () => categoryService.getAdminTree(),
    staleTime: 10 * 60 * 1000,
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

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Category>) => categoryService.create(data),
    onSuccess: async () => {
      await refreshCategoryQueries(queryClient);
      toast.success('دسته‌بندی ایجاد شد');
    },
    onError: (e: ApiError) =>
      toast.error(errorMessage(e, 'خطا در ایجاد دسته‌بندی')),
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Category> }) =>
      categoryService.update(id, data),
    onSuccess: async () => {
      await refreshCategoryQueries(queryClient);
      toast.success('دسته‌بندی بروزرسانی شد');
    },
    onError: (e: ApiError) =>
      toast.error(errorMessage(e, 'خطا در بروزرسانی دسته‌بندی')),
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, force }: { id: string; force?: boolean }) =>
      categoryService.delete(id, force),
    onSuccess: async () => {
      await refreshCategoryQueries(queryClient);
      toast.success('دسته‌بندی حذف شد');
    },
    onError: (e: ApiError) =>
      toast.error(errorMessage(e, 'خطا در حذف دسته‌بندی')),
  });
}
