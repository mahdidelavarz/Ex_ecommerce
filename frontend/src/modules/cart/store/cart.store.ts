// src/modules/cart/store/cart.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Cart } from '../types/cart.types';

interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  isOpen: boolean; // for cart drawer

  setCart: (cart: Cart | null) => void;
  setLoading: (loading: boolean) => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      cart: null,
      isLoading: false,
      isOpen: false,

      setCart: (cart) => set({ cart }),
      setLoading: (isLoading) => set({ isLoading }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ cart: state.cart }), // only persist cart data
    }
  )
);