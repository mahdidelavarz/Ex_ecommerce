// src/modules/orders/hooks/useOrders.ts
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService } from '../services/order.service';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export function useMyOrders(params?: any) {
  return useQuery({ queryKey: ['orders', 'my', params], queryFn: () => orderService.myOrders(params) });
}

export function useOrder(id: string) {
  return useQuery({ queryKey: ['orders', id], queryFn: () => orderService.getById(id), enabled: !!id });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: orderService.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('سفارش با موفقیت ثبت شد');
      router.push(`/orders/${data.id}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'خطا در ثبت سفارش');
    },
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: orderService.cancel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('سفارش لغو شد');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'خطا در لغو سفارش');
    },
  });
}