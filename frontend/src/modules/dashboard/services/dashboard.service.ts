// src/modules/dashboard/services/dashboard.service.ts
import { apiClient } from '@/lib/api-client';
import type { ApiResponse } from '@/modules/auth/types/auth.type';
import type { DashboardStats, LowStockVariant } from '../types/dashboard.types';

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const r = await apiClient.get<ApiResponse<DashboardStats>>('/dashboard/stats');
    return r.data.data;
  },

  getLowStock: async (): Promise<LowStockVariant[]> => {
    const r = await apiClient.get<ApiResponse<LowStockVariant[]>>('/dashboard/low-stock');
    return r.data.data;
  },
};
