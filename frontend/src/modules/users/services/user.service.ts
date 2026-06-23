// src/modules/users/services/user.service.ts
import { apiClient } from '@/lib/api-client';
import type { ApiResponse } from '@/modules/auth/types/auth.type';
import type { AdminUser, UserListParams, UserRole } from '../types/user.types';

export const userService = {
  list: async (params?: UserListParams) => {
    const r = await apiClient.get<ApiResponse<AdminUser[]> & { meta: any }>('/users', { params });
    return { data: r.data.data, meta: r.data.meta };
  },

  getById: async (id: string): Promise<AdminUser> => {
    const r = await apiClient.get<ApiResponse<AdminUser>>(`/users/${id}`);
    return r.data.data;
  },

  updateRole: async (id: string, role: UserRole): Promise<AdminUser> => {
    const r = await apiClient.patch<ApiResponse<AdminUser>>(`/users/${id}/role`, { role });
    return r.data.data;
  },

  updateStatus: async (id: string, is_active: boolean): Promise<AdminUser> => {
    const r = await apiClient.patch<ApiResponse<AdminUser>>(`/users/${id}/status`, { is_active });
    return r.data.data;
  },
};
