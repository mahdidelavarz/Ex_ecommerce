// src/components/layout/adminMenu.store.ts
// Shared open/close state for the admin mobile sidebar drawer (MobileAdminNav).
// Lifted out of AdminSidebar so the header burger button can open it too.
import { create } from 'zustand';

interface AdminMenuState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export const useAdminMenuStore = create<AdminMenuState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
}));
