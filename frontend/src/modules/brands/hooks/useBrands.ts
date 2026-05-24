// src/modules/brands/hooks/useBrands.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import { brandService } from '../services/brand.service';

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