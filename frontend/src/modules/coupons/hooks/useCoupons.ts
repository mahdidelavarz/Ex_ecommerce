// src/modules/coupons/hooks/useCoupons.ts
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { couponService } from '../services/coupon.service';

export function useCoupons(params?: any) {
  return useQuery({ queryKey: ['coupons', params], queryFn: () => couponService.list(params) });
}

export function useCoupon(id: string) {
  return useQuery({ queryKey: ['coupons', id], queryFn: () => couponService.getById(id), enabled: !!id && id !== 'new' });
}

export function useCreateCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => couponService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      toast.success('کد تخفیف ایجاد شد');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'خطا در ایجاد کد تخفیف');
    },
  });
}

export function useUpdateCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => couponService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      toast.success('کد تخفیف بروزرسانی شد');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'خطا در بروزرسانی');
    },
  });
}

export function useDeleteCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => couponService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      toast.success('کد تخفیف حذف شد');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'خطا در حذف');
    },
  });
}
