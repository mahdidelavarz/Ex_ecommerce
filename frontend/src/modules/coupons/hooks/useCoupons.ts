// src/modules/coupons/hooks/useCoupons.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import { couponService } from '../services/coupon.service';

export function useCoupons(params?: any) {
  return useQuery({ queryKey: ['coupons', params], queryFn: () => couponService.list(params) });
}

export function useCoupon(id: string) {
  return useQuery({ queryKey: ['coupons', id], queryFn: () => couponService.getById(id), enabled: !!id });
}