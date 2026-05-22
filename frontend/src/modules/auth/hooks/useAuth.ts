// src/modules/auth/hooks/useAuth.ts
'use client';

import { useAuthStore } from '../store/auth.store';
import { authService } from '../services/auth.service';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const { user, isAuthenticated, isLoading, login, logout, updateUser } =
    useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      logout();
      router.push('/login');
    }
  };

  const isAdmin = user?.role === 'admin';
  const needsProfileCompletion = isAuthenticated && !user?.profile_completed;

  return {
    user,
    isAuthenticated,
    isLoading,
    isAdmin,
    needsProfileCompletion,
    login,
    logout: handleLogout,
    updateUser,
  };
}