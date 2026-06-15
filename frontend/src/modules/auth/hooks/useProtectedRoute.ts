// src/modules/auth/hooks/useProtectedRoute.ts
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../store/auth.store';

export function useProtectedRoute() {
  const { user, isAuthenticated, isLoading, isInitialized } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isInitialized && !isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isInitialized, isLoading, isAuthenticated, router]);

  return { user, isLoading: !isInitialized || isLoading || !isAuthenticated };
}