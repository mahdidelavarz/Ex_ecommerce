// src/modules/auth/hooks/useProtectedRoute.ts
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getLoginRedirectPath } from '@/lib/public-routes';
import { useAuthStore } from '../store/auth.store';

export function useProtectedRoute() {
  const { user, isAuthenticated, isLoading, isInitialized } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isInitialized && !isLoading && !isAuthenticated) {
      const currentPath = `${window.location.pathname}${window.location.search}`;
      router.replace(getLoginRedirectPath(currentPath));
    }
  }, [isInitialized, isLoading, isAuthenticated, router]);

  return { user, isLoading: !isInitialized || isLoading || !isAuthenticated };
}
