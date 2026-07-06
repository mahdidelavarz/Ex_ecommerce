'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/modules/auth/store/auth.store';
import { cartService } from '../services/cart.service';

const CART_KEY = ['cart'];
const inFlightMerges = new Map<string, Promise<void>>();
const completedMerges = new Set<string>();

export default function CartMergeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = useQueryClient();
  const { isAuthenticated, isInitialized, user } = useAuthStore();

  useEffect(() => {
    if (!isInitialized || !isAuthenticated || !user?.id) return;

    const sessionId = localStorage.getItem('cart_session_id');
    if (!sessionId) return;

    const mergeKey = `${user.id}:${sessionId}`;
    if (completedMerges.has(mergeKey) || inFlightMerges.has(mergeKey)) return;

    const merge = cartService
      .mergeCart()
      .then(() => {
        completedMerges.add(mergeKey);
        queryClient.invalidateQueries({ queryKey: CART_KEY });
      })
      .catch((error: unknown) => {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Failed to merge guest cart', error);
        }
      })
      .finally(() => {
        inFlightMerges.delete(mergeKey);
      });

    inFlightMerges.set(mergeKey, merge);
  }, [isAuthenticated, isInitialized, queryClient, user?.id]);

  return <>{children}</>;
}
