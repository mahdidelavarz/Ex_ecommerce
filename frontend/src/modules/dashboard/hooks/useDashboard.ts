// src/modules/dashboard/hooks/useDashboard.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboard.service';
import type { DashboardPeriod } from '../types/dashboard.types';

export function useDashboardStats(period: DashboardPeriod) {
  return useQuery({
    queryKey: ['dashboard', 'stats', period],
    queryFn: () => dashboardService.getStats(period),
    staleTime: 60 * 1000,
  });
}

export function useSalesSeries(period: DashboardPeriod) {
  return useQuery({
    queryKey: ['dashboard', 'sales-series', period],
    queryFn: () => dashboardService.getSalesSeries(period),
    staleTime: 60 * 1000,
  });
}

export function useTopProducts(period: DashboardPeriod) {
  return useQuery({
    queryKey: ['dashboard', 'top-products', period],
    queryFn: () => dashboardService.getTopProducts(period),
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
