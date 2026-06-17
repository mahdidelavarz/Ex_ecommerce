// src/modules/attributes/hooks/useAttributes.ts
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
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

export function useCreateAttribute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; type?: string; values?: { value: string; color_code?: string }[] }) =>
      attributeService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attributes'] });
      toast.success('ویژگی ایجاد شد');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'خطا در ایجاد ویژگی'),
  });
}

export function useUpdateAttribute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; type?: string } }) =>
      attributeService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attributes'] });
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'خطا در بروزرسانی ویژگی'),
  });
}

export function useDeleteAttribute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => attributeService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attributes'] });
      toast.success('ویژگی حذف شد');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'خطا در حذف ویژگی'),
  });
}

export function useAddAttributeValue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ attributeId, data }: { attributeId: string; data: { value: string; color_code?: string } }) =>
      attributeService.addValue(attributeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attributes'] });
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'خطا در افزودن مقدار'),
  });
}

export function useDeleteAttributeValue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (valueId: string) => attributeService.deleteValue(valueId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attributes'] });
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'خطا در حذف مقدار'),
  });
}