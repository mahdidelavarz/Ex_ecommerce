// src/modules/tags/services/tag.service.ts
import { apiClient } from '@/lib/api-client';
import type { ApiResponse } from '@/modules/auth/types/auth.type';
import type { Tag } from '../types/tag.types';

export type { Tag };

export const tagService = {
  list: async (params?: any) => {
    const r = await apiClient.get<ApiResponse<Tag[]> & { meta: any }>('/tags', { params });
    return { data: r.data.data, meta: r.data.meta };
  },
  all: async (): Promise<Tag[]> => {
    const r = await apiClient.get<ApiResponse<Tag[]>>('/tags/all');
    return r.data.data;
  },
  create: async (data: { name: string }) => {
    const r = await apiClient.post<ApiResponse<Tag>>('/tags', data);
    return r.data.data;
  },
  update: async (id: string, data: { name?: string }) => {
    const r = await apiClient.patch<ApiResponse<Tag>>(`/tags/${id}`, data);
    return r.data.data;
  },
  delete: async (id: string) => {
    await apiClient.delete(`/tags/${id}`);
  },
};