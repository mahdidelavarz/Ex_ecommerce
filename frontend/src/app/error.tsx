// src/app/error.tsx
// Route-segment error boundary — catches runtime render errors in any page
// under the root layout so the app shows a graceful fallback instead of a
// white screen. (Next.js App Router renders this automatically.)
'use client';

import { useEffect } from 'react';
import ErrorState from '@/components/ui/ErrorState';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface for logging/observability.
    console.error('Route error boundary caught:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <ErrorState onRetry={reset} detail={error.digest} />
    </div>
  );
}
