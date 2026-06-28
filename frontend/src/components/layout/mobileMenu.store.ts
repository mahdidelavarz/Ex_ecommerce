// src/components/layout/mobileMenu.store.ts
// Shared open/close state for the mobile category drawer (MobileCategoryMenu).
// Lifted out of Header so the bottom-nav "Categories" item can open it too.
import { create } from 'zustand';

interface MobileMenuState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export const useMobileMenuStore = create<MobileMenuState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
}));
