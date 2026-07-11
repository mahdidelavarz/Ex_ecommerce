// src/components/layout/adminMenu.store.ts
// Shared open/close state for the admin mobile sidebar drawer (MobileAdminNav).
// Lifted out of AdminSidebar so the header burger button can open it too.
import { create } from 'zustand';

interface AdminMenuState {
  isOpen: boolean;
  isCollapsed: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  toggleCollapsed: () => void;
}

export const useAdminMenuStore = create<AdminMenuState>((set) => ({
  isOpen: false,
  isCollapsed: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
  toggleCollapsed: () => set((s) => ({ isCollapsed: !s.isCollapsed })),
}));
