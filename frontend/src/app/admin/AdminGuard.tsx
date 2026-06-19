'use client';

import { useAdminRoute } from '@/modules/auth/hooks/useAdminRoute';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAdminRoute();

  if (isLoading) return null;

  return <>{children}</>;
}
