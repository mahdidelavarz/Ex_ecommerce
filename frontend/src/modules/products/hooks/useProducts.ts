// src/modules/products/hooks/useProducts.ts
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { productService } from '../services/product.service';
import type { ProductListResponse } from '../types/product.types';

type ProductListResult = { data: ProductListResponse[]; meta: any };

export function useProducts(
  params?: Record<string, any>,
  options?: { initialData?: ProductListResult },
) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productService.list(params),
    staleTime: 2 * 60 * 1000,
    initialData: options?.initialData,
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ['products', slug],
    queryFn: () => productService.getBySlug(slug),
    enabled: !!slug,
    staleTime: 2 * 60 * 1000,
  });
}

export function useRelatedProducts(slug: string) {
  return useQuery({
    queryKey: ['products', slug, 'related'],
    queryFn: () => productService.getRelated(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
}

export function useProductFilters(categoryId: string) {
  return useQuery({
    queryKey: ['products', 'filters', categoryId],
    queryFn: () => productService.getFilters(categoryId),
    enabled: !!categoryId,
    staleTime: 10 * 60 * 1000,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => productService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('محصول ایجاد شد');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'خطا در ایجاد محصول'),
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      productService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('محصول بروزرسانی شد');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'خطا در بروزرسانی محصول'),
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('محصول حذف شد');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'خطا در حذف محصول'),
  });
}

export function useBulkProductStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ids, is_active }: { ids: string[]; is_active: boolean }) =>
      productService.bulkStatus(ids, is_active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('وضعیت محصولات بروزرسانی شد');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'خطا در بروزرسانی'),
  });
}