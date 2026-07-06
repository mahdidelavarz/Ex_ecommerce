'use client';

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import type { QueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  productService,
  type ProductListParams,
  type ProductListResult,
  type ProductMutationPayload,
} from '../services/product.service';

type ApiError = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

function refreshProductQueries(queryClient: QueryClient) {
  return queryClient.invalidateQueries({
    queryKey: ['products'],
    refetchType: 'all',
  });
}

function errorMessage(error: ApiError, fallback: string) {
  return error.response?.data?.message || fallback;
}

export function useProducts(
  params?: ProductListParams,
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
    mutationFn: (data: ProductMutationPayload) => productService.create(data),
    onSuccess: async () => {
      await refreshProductQueries(queryClient);
      toast.success('محصول ایجاد شد');
    },
    onError: (e: ApiError) =>
      toast.error(errorMessage(e, 'خطا در ایجاد محصول')),
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProductMutationPayload }) =>
      productService.update(id, data),
    onSuccess: async () => {
      await refreshProductQueries(queryClient);
      toast.success('محصول بروزرسانی شد');
    },
    onError: (e: ApiError) =>
      toast.error(errorMessage(e, 'خطا در بروزرسانی محصول')),
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productService.delete(id),
    onSuccess: async () => {
      await refreshProductQueries(queryClient);
      toast.success('محصول حذف شد');
    },
    onError: (e: ApiError) =>
      toast.error(errorMessage(e, 'خطا در حذف محصول')),
  });
}

export function useBulkProductStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ids, is_active }: { ids: string[]; is_active: boolean }) =>
      productService.bulkStatus(ids, is_active),
    onSuccess: async () => {
      await refreshProductQueries(queryClient);
      toast.success('وضعیت محصولات بروزرسانی شد');
    },
    onError: (e: ApiError) =>
      toast.error(errorMessage(e, 'خطا در بروزرسانی')),
  });
}
