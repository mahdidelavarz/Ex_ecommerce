// src/modules/cart/services/cart.service.ts
import { apiClient } from '@/lib/api-client';
import type { ApiResponse } from '@/modules/auth/types/auth.type';
import type { Cart } from '../types/cart.types';

const getSessionId = (): string => {
  if (typeof window === 'undefined') return '';
  let sessionId = localStorage.getItem('cart_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('cart_session_id', sessionId);
  }
  return sessionId;
};

export const cartService = {
  /**
   * Get current cart
   */
  getCart: async (): Promise<Cart> => {
    const response = await apiClient.get<ApiResponse<Cart>>('/cart', {
      headers: { 'x-session-id': getSessionId() },
    });
    return response.data.data;
  },

  /**
   * Add item to cart
   */
  addItem: async (variant_id: string, quantity: number = 1): Promise<Cart> => {
    const response = await apiClient.post<ApiResponse<Cart>>(
      '/cart/items',
      { variant_id, quantity },
      { headers: { 'x-session-id': getSessionId() } }
    );
    return response.data.data;
  },

  /**
   * Update item quantity
   */
  updateItem: async (itemId: string, quantity: number): Promise<void> => {
    await apiClient.patch(
      `/cart/items/${itemId}`,
      { quantity },
      { headers: { 'x-session-id': getSessionId() } }
    );
  },

  /**
   * Remove item from cart
   */
  removeItem: async (itemId: string): Promise<void> => {
    await apiClient.delete(`/cart/items/${itemId}`, {
      headers: { 'x-session-id': getSessionId() },
    });
  },

  /**
   * Clear entire cart
   */
  clearCart: async (): Promise<void> => {
    await apiClient.delete('/cart', {
      headers: { 'x-session-id': getSessionId() },
    });
  },

  /**
   * Merge guest cart into user cart after login
   */
  mergeCart: async (): Promise<void> => {
    const sessionId = localStorage.getItem('cart_session_id');
    if (sessionId) {
      await apiClient.post('/cart/merge', { session_id: sessionId });
      localStorage.removeItem('cart_session_id');
    }
  },
};