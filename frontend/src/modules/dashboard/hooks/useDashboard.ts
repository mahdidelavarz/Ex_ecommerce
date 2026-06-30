// src/modules/dashboard/hooks/useDashboard.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboard.service';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: dashboardService.getStats,
    staleTime: 60 * 1000,
  });
}

export function useLowStockVariants() {
  return useQuery({
    queryKey: ['dashboard', 'low-stock'],
    queryFn: dashboardService.getLowStock,
    staleTime: 60 * 1000,
  });
}
