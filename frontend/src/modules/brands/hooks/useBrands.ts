'use client';

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import type { QueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  brandService,
  type CreateBrandInput,
} from '../services/brand.service';
import type { Brand } from '../types/brand.types';

type ApiError = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

function refreshBrandQueries(queryClient: QueryClient) {
  return queryClient.invalidateQueries({
    queryKey: ['brands'],
    refetchType: 'active',
  });
}

function errorMessage(error: ApiError, fallback: string) {
  return error.response?.data?.message || fallback;
}

export function useBrands(params?: {
  search?: string;
  is_active?: boolean;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['brands', params],
    queryFn: () => brandService.list(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useAllBrands() {
  return useQuery({
    queryKey: ['brands', 'all'],
    queryFn: () => brandService.all(),
    staleTime: 10 * 60 * 1000,
  });
}

export function useBrand(slug: string) {
  return useQuery({
    queryKey: ['brands', slug],
    queryFn: () => brandService.getBySlug(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateBrand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBrandInput) => brandService.create(data),
    onSuccess: async () => {
      await refreshBrandQueries(queryClient);
      toast.success('برند ایجاد شد');
    },
    onError: (e: ApiError) =>
      toast.error(errorMessage(e, 'خطا در ایجاد برند')),
  });
}

export function useUpdateBrand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Brand> }) =>
      brandService.update(id, data),
    onSuccess: async () => {
      await refreshBrandQueries(queryClient);
      toast.success('برند بروزرسانی شد');
    },
    onError: (e: ApiError) =>
      toast.error(errorMessage(e, 'خطا در بروزرسانی برند')),
  });
}

export function useDeleteBrand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => brandService.delete(id),
    onSuccess: async () => {
      await refreshBrandQueries(queryClient);
      toast.success('برند حذف شد');
    },
    onError: (e: ApiError) =>
      toast.error(errorMessage(e, 'خطا در حذف برند')),
  });
}
