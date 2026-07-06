'use client';

import { ReactNode, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getLoginRedirectPath, isProtectedRoute } from '@/lib/public-routes';
import { useAuthStore } from '../store/auth.store';

export default function AuthRouteGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname() || '/';
  const router = useRouter();
  const { isAuthenticated, isInitialized, isLoading } = useAuthStore();
  const isProtected = isProtectedRoute(pathname);

  useEffect(() => {
    if (!isProtected || !isInitialized || isLoading || isAuthenticated) {
      return;
    }

    const currentPath = `${window.location.pathname}${window.location.search}`;
    router.replace(getLoginRedirectPath(currentPath));
  }, [isAuthenticated, isInitialized, isLoading, isProtected, router]);

  if (!isProtected || isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-dvh items-center justify-center overflow-hidden bg-background text-text-secondary">
      در حال بارگذاری...
    </div>
  );
}
