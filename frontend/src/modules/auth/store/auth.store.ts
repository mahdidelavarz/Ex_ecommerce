// src/modules/auth/store/auth.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser } from '../types/auth.type';

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  refreshToken: string | null;

  // Actions
  setUser: (user: AuthUser | null) => void;
  setRefreshToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  login: (user: AuthUser, refreshToken: string) => void;
  logout: () => void;
  updateUser: (user: Partial<AuthUser>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      refreshToken: null,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
        }),

      setRefreshToken: (token) => set({ refreshToken: token }),

      setLoading: (loading) => set({ isLoading: loading }),

      login: (user, refreshToken) =>
        set({
          user,
          refreshToken,
          isAuthenticated: true,
        }),

      logout: () =>
        set({
          user: null,
          refreshToken: null,
          isAuthenticated: false,
        }),

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        refreshToken: state.refreshToken,
      }),
    }
  )
);