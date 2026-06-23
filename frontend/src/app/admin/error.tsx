// src/app/admin/error.tsx
// Admin-scoped error boundary — keeps the error contained to the admin area.
'use client';

import { useEffect } from 'react';
import ErrorState from '@/components/ui/ErrorState';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Admin error boundary caught:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <ErrorState
        onRetry={reset}
        showHomeLink={false}
        message="خطایی در پنل مدیریت رخ داد. لطفاً دوباره تلاش کنید."
        detail={error.digest}
      />
    </div>
  );
}
