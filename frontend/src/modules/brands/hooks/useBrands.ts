// src/modules/brands/hooks/useBrands.ts
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { brandService } from '../services/brand.service';
import type { Brand } from '../types/brand.types';

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
    mutationFn: (data: Partial<Brand>) => brandService.create(data as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      toast.success('برند ایجاد شد');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'خطا در ایجاد برند'),
  });
}

export function useUpdateBrand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Brand> }) =>
      brandService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      toast.success('برند بروزرسانی شد');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'خطا در بروزرسانی برند'),
  });
}

export function useDeleteBrand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => brandService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      toast.success('برند حذف شد');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'خطا در حذف برند'),
  });
}