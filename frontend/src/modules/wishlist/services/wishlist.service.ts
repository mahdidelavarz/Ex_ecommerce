// src/modules/wishlist/services/wishlist.service.ts
import { apiClient } from '@/lib/api-client';
import type { ApiResponse } from '@/modules/auth/types/auth.type';
import type { WishlistItem } from '../types/wishlist.types';

export const wishlistService = {
  list: async (): Promise<WishlistItem[]> => {
    const r = await apiClient.get<ApiResponse<WishlistItem[]>>('/wishlist');
    return r.data.data;
  },
  add: async (variant_id: string): Promise<void> => {
    await apiClient.post('/wishlist', { variant_id });
  },
  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/wishlist/${id}`);
  },
  check: async (variantId: string): Promise<boolean> => {
    const r = await apiClient.get<ApiResponse<{ is_wishlisted: boolean }>>(`/wishlist/check/${variantId}`);
    return r.data.data.is_wishlisted;
  },
};