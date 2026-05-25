// src/modules/cart/hooks/useCart.ts
'use client';

import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartService } from '../services/cart.service';
import { useCartStore } from '../store/cart.store';
import { useAuthStore } from '@/modules/auth/store/auth.store';
import toast from 'react-hot-toast';

export function useCart() {
  const queryClient = useQueryClient();
  const { setCart, setLoading } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const { data: cart, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: () => cartService.getCart(),
    staleTime: 30 * 1000, // 30 seconds
    enabled: true,
  });

  // Sync cart to store
  useEffect(() => {
    if (cart) setCart(cart);
    setLoading(isLoading);
  }, [cart, isLoading, setCart, setLoading]);

  // Merge guest cart when user logs in
  useEffect(() => {
    if (isAuthenticated) {
      cartService.mergeCart().then(() => {
        queryClient.invalidateQueries({ queryKey: ['cart'] });
      });
    }
  }, [isAuthenticated, queryClient]);

  const addItem = useMutation({
    mutationFn: ({ variant_id, quantity = 1 }: { variant_id: string; quantity?: number }) =>
      cartService.addItem(variant_id, quantity),
    onSuccess: (data) => {
      setCart(data);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('به سبد خرید اضافه شد');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'خطا در افزودن به سبد خرید');
    },
  });

  const updateItem = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      cartService.updateItem(itemId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'خطا');
    },
  });

  const removeItem = useMutation({
    mutationFn: (itemId: string) => cartService.removeItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('از سبد خرید حذف شد');
    },
  });

  const clearCart = useMutation({
    mutationFn: () => cartService.clearCart(),
    onSuccess: () => {
      setCart(null);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  return {
    cart,
    isLoading,
    addItem: addItem.mutate,
    updateItem: updateItem.mutate,
    removeItem: removeItem.mutate,
    clearCart: clearCart.mutate,
    isAdding: addItem.isPending,
  };
}