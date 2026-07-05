// src/modules/auth/hooks/useAdminRoute.ts
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getLoginRedirectPath } from '@/lib/public-routes';
import { useAuthStore } from '../store/auth.store';

export function useAdminRoute() {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        const currentPath = `${window.location.pathname}${window.location.search}`;
        router.replace(getLoginRedirectPath(currentPath));
      } else if (user?.role !== 'admin') {
        router.replace('/');
      }
    }
  }, [isLoading, isAuthenticated, user?.role, router]);

  return { user, isLoading: isLoading || !isAuthenticated || user?.role !== 'admin' };
}
