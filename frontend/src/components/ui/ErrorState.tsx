// src/components/ui/ErrorState.tsx
'use client';

import Link from 'next/link';
import { MdiAlertCircle } from '@/components/icons/Icons';

interface ErrorStateProps {
  /** Called to re-render the failed segment (Next.js `reset`). */
  onRetry?: () => void;
  /** Show a "back to home" link. */
  showHomeLink?: boolean;
  title?: string;
  message?: string;
  /** Optional technical detail (e.g. error.digest) — shown small/muted. */
  detail?: string;
}

export default function ErrorState({
  onRetry,
  showHomeLink = true,
  title = 'مشکلی پیش آمد',
  message = 'خطای غیرمنتظره‌ای رخ داد. لطفاً دوباره تلاش کنید.',
  detail,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center px-4 py-16">
      <div className="w-16 h-16 rounded-full bg-error-light flex items-center justify-center mb-4">
        <MdiAlertCircle className="w-8 h-8 text-error" />
      </div>
      <h2 className="text-xl font-bold text-text-primary mb-2">{title}</h2>
      <p className="text-text-secondary text-sm mb-2 max-w-md">{message}</p>
      {detail && <p className="text-text-muted text-xs mb-6 font-mono">{detail}</p>}

      <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-6 py-2.5 bg-primary text-white rounded-button font-medium hover:bg-primary-hover transition-colors"
          >
            تلاش مجدد
          </button>
        )}
        {showHomeLink && (
          <Link
            href="/"
            className="px-6 py-2.5 border-2 border-primary text-primary rounded-button font-medium hover:bg-primary-light transition-colors"
          >
            بازگشت به خانه
          </Link>
        )}
      </div>
    </div>
  );
}
