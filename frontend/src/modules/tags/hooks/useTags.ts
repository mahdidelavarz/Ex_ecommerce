// src/modules/tags/hooks/useTags.ts
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { tagService } from '../services/tag.service';

export function useTags(params?: any) {
  return useQuery({ queryKey: ['tags', params], queryFn: () => tagService.list(params), staleTime: 10 * 60 * 1000 });
}

export function useAllTags() {
  return useQuery({ queryKey: ['tags', 'all'], queryFn: () => tagService.all(), staleTime: 10 * 60 * 1000 });
}

export function useCreateTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string }) => tagService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      toast.success('تگ ایجاد شد');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'خطا در ایجاد تگ'),
  });
}

export function useUpdateTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string } }) => tagService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      toast.success('تگ بروزرسانی شد');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'خطا در بروزرسانی تگ'),
  });
}

export function useDeleteTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tagService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      toast.success('تگ حذف شد');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'خطا در حذف تگ'),
  });
}