// src/modules/cart/hooks/useCart.ts
'use client';

import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartService } from '../services/cart.service';
import { useCartStore } from '../store/cart.store';
import { useAuthStore } from '@/modules/auth/store/auth.store';
import type { Cart, CartItem, CartVariant } from '../types/cart.types';
import toast from 'react-hot-toast';

const CART_KEY = ['cart'];

// Recompute derived totals after an optimistic items change.
function recalcCart(cart: Cart, items: Cart['items']): Cart {
  return {
    ...cart,
    items,
    total_items: items.length,
    total_quantity: items.reduce((sum, i) => sum + i.quantity, 0),
    subtotal: items.reduce((sum, i) => sum + i.variant.price * i.quantity, 0),
  };
}

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
    if (!isAuthenticated) return;
    const merge = async () => {
      await cartService.mergeCart();
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    };
    merge();
  }, [isAuthenticated, queryClient]);

  const addItem = useMutation({
    mutationFn: ({ variant_id, quantity = 1 }: { variant_id: string; quantity?: number; variant?: CartVariant }) =>
      cartService.addItem(variant_id, quantity),
    // Optimistically update the cart. If the variant is already present we bump
    // its quantity; if a `variant` snapshot is supplied we render a brand-new
    // line item immediately (temp id). The authoritative server response in
    // onSuccess reconciles temp ids / totals.
    onMutate: async ({ variant_id, quantity = 1, variant }) => {
      await queryClient.cancelQueries({ queryKey: CART_KEY });
      const previous = queryClient.getQueryData<Cart>(CART_KEY);
      if (previous) {
        const existing = previous.items.find((i) => i.variant_id === variant_id);
        if (existing) {
          const items = previous.items.map((i) =>
            i.variant_id === variant_id ? { ...i, quantity: i.quantity + quantity } : i
          );
          queryClient.setQueryData<Cart>(CART_KEY, recalcCart(previous, items));
        } else if (variant) {
          const optimisticItem: CartItem = {
            id: `optimistic-${variant_id}-${Date.now()}`,
            variant_id,
            quantity,
            variant,
          };
          queryClient.setQueryData<Cart>(CART_KEY, recalcCart(previous, [...previous.items, optimisticItem]));
        }
      }
      return { previous };
    },
    onSuccess: (data) => {
      setCart(data);
      queryClient.setQueryData<Cart>(CART_KEY, data);
      toast.success('به سبد خرید اضافه شد');
    },
    onError: (error: any, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(CART_KEY, ctx.previous);
      toast.error(error.response?.data?.message || 'خطا در افزودن به سبد خرید');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: CART_KEY });
    },
  });

  const updateItem = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      cartService.updateItem(itemId, quantity),
    onMutate: async ({ itemId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: CART_KEY });
      const previous = queryClient.getQueryData<Cart>(CART_KEY);
      if (previous) {
        const items = previous.items.map((i) =>
          i.id === itemId ? { ...i, quantity } : i
        );
        queryClient.setQueryData<Cart>(CART_KEY, recalcCart(previous, items));
      }
      return { previous };
    },
    onError: (error: any, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(CART_KEY, ctx.previous);
      toast.error(error.response?.data?.message || 'خطا');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: CART_KEY });
    },
  });

  const removeItem = useMutation({
    mutationFn: (itemId: string) => cartService.removeItem(itemId),
    onMutate: async (itemId) => {
      await queryClient.cancelQueries({ queryKey: CART_KEY });
      const previous = queryClient.getQueryData<Cart>(CART_KEY);
      if (previous) {
        const items = previous.items.filter((i) => i.id !== itemId);
        queryClient.setQueryData<Cart>(CART_KEY, recalcCart(previous, items));
      }
      return { previous };
    },
    onSuccess: () => {
      toast.success('از سبد خرید حذف شد');
    },
    onError: (error: any, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(CART_KEY, ctx.previous);
      toast.error(error.response?.data?.message || 'خطا در حذف از سبد خرید');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: CART_KEY });
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