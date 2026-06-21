// src/modules/settings/services/setting.service.ts
import { apiClient } from '@/lib/api-client';
import type { ApiResponse } from '@/modules/auth/types/auth.type';

export interface AppSetting {
  key: string;
  value: string;
  label: string;
  updated_at: string;
}

export const settingService = {
  list: async (): Promise<AppSetting[]> => {
    const res = await apiClient.get<ApiResponse<AppSetting[]>>('/settings');
    return res.data.data;
  },

  getByKey: async (key: string): Promise<AppSetting> => {
    const res = await apiClient.get<ApiResponse<AppSetting>>(`/settings/${key}`);
    return res.data.data;
  },

  update: async (key: string, value: string): Promise<AppSetting> => {
    const res = await apiClient.patch<ApiResponse<AppSetting>>(`/settings/${key}`, { value });
    return res.data.data;
  },
};
