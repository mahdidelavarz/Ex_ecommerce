// src/modules/wishlist/hooks/useWishlist.ts
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { wishlistService } from '../services/wishlist.service';
import toast from 'react-hot-toast';

export function useWishlist() {
  return useQuery({ queryKey: ['wishlist'], queryFn: wishlistService.list });
}

export function useAddToWishlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: wishlistService.add,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success('به علاقه‌مندی‌ها اضافه شد');
    },
    onError: (error: any) => toast.error(error.response?.data?.message || 'خطا'),
  });
}

export function useRemoveFromWishlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: wishlistService.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success('از علاقه‌مندی‌ها حذف شد');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'خطا در حذف از علاقه‌مندی‌ها'),
  });
}