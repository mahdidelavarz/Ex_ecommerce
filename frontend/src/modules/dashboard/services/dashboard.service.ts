// src/modules/dashboard/services/dashboard.service.ts
import { apiClient } from '@/lib/api-client';
import type { ApiResponse } from '@/modules/auth/types/auth.type';
import type {
  DashboardStats,
  DashboardPeriod,
  SalesSeriesPoint,
  TopProduct,
  LowStockVariant,
} from '../types/dashboard.types';

export const dashboardService = {
  getStats: async (period: DashboardPeriod): Promise<DashboardStats> => {
    const r = await apiClient.get<ApiResponse<DashboardStats>>('/dashboard/stats', {
      params: { period },
    });
    return r.data.data;
  },

  getSalesSeries: async (period: DashboardPeriod): Promise<SalesSeriesPoint[]> => {
    const r = await apiClient.get<ApiResponse<SalesSeriesPoint[]>>('/dashboard/sales-series', {
      params: { period },
    });
    return r.data.data;
  },

  getTopProducts: async (period: DashboardPeriod): Promise<TopProduct[]> => {
    const r = await apiClient.get<ApiResponse<TopProduct[]>>('/dashboard/top-products', {
      params: { period },
    });
    return r.data.data;
  },

  getLowStock: async (): Promise<LowStockVariant[]> => {
    const r = await apiClient.get<ApiResponse<LowStockVariant[]>>('/dashboard/low-stock');
    return r.data.data;
  },
};
