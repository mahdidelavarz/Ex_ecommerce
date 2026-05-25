// src/modules/attributes/hooks/useAttributes.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import { attributeService } from '../services/attribute.service';

export function useAttributes(params?: { search?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['attributes', params],
    queryFn: () => attributeService.list(params),
    staleTime: 10 * 60 * 1000,
  });
}

export function useAllAttributes() {
  return useQuery({
    queryKey: ['attributes', 'all'],
    queryFn: () => attributeService.all(),
    staleTime: 10 * 60 * 1000,
  });
}

export function useAttribute(id: string) {
  return useQuery({
    queryKey: ['attributes', id],
    queryFn: () => attributeService.getById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });
}