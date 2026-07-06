// src/modules/wishlist/hooks/useWishlist.ts
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { wishlistService } from '../services/wishlist.service';
import { useAuthStore } from '@/modules/auth/store/auth.store';
import toast from 'react-hot-toast';

function getErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { message?: unknown } } }).response;
    if (typeof response?.data?.message === 'string') {
      return response.data.message;
    }
  }

  return fallback;
}

export function useWishlist() {
  const { user, isAuthenticated, isInitialized } = useAuthStore();

  return useQuery({
    queryKey: ['wishlist', user?.id],
    queryFn: wishlistService.list,
    enabled: isInitialized && isAuthenticated,
  });
}

export function useAddToWishlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: wishlistService.add,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success('به علاقه‌مندی‌ها اضافه شد');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error, 'خطا')),
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
    onError: (error: unknown) => toast.error(getErrorMessage(error, 'خطا در حذف از علاقه‌مندی‌ها')),
  });
}
