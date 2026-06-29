// src/modules/products/hooks/useProducts.ts
'use client';

import { useQuery } from '@tanstack/react-query';
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