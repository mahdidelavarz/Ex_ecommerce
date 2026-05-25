// src/modules/tags/hooks/useTags.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import { tagService } from '../services/tag.service';

export function useTags(params?: any) {
  return useQuery({ queryKey: ['tags', params], queryFn: () => tagService.list(params), staleTime: 10 * 60 * 1000 });
}

export function useAllTags() {
  return useQuery({ queryKey: ['tags', 'all'], queryFn: () => tagService.all(), staleTime: 10 * 60 * 1000 });
}