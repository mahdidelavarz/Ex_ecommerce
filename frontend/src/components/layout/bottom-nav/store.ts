// src/components/layout/bottom-nav/store.ts
// Holds the active configuration for the global mobile bottom bar.
// Pages push their context here (via useBottomBar) and the globally-mounted
// <BottomNav /> renders the matching variant.
import { create } from 'zustand';
import type { CartVariant } from '@/modules/cart/types/cart.types';

export type BottomBarConfig =
  // Default quick-nav (Home / Categories / Search / Cart / Wishlist).
  | { mode: 'nav' }
  // Fully hidden (e.g. a page that owns the whole screen).
  | { mode: 'hidden' }
  // Product detail: qty stepper + price + add-to-cart.
  | {
      mode: 'product';
      variantId: string;
      price: number;
      comparePrice: number | null;
      stock: number;
      snapshot: CartVariant;
    }
  // Checkout / cart: a total + a single primary action button.
  | {
      mode: 'action';
      label: string;
      total?: number;
      onAction: () => void;
      loading?: boolean;
      disabled?: boolean;
    };

interface BottomBarState {
  config: BottomBarConfig;
  setConfig: (config: BottomBarConfig) => void;
  reset: () => void;
}

const DEFAULT: BottomBarConfig = { mode: 'nav' };

export const useBottomBarStore = create<BottomBarState>((set) => ({
  config: DEFAULT,
  setConfig: (config) => set({ config }),
  reset: () => set({ config: DEFAULT }),
}));
