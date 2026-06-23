// src/app/global-error.tsx
// Last-resort boundary that catches errors thrown in the ROOT layout itself.
// It replaces the entire document, so it must render its own <html>/<body> and
// cannot rely on the app's providers, fonts, or CSS — styles are inlined.
'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error boundary caught:', error);
  }, [error]);

  return (
    <html lang="fa" dir="rtl">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Vazirmatn, Tahoma, sans-serif',
          background: '#f8fafc',
          color: '#0f172a',
          textAlign: 'center',
          padding: '1rem',
        }}
      >
        <div style={{ maxWidth: 420 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '9999px',
              background: '#fee2e2',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 32,
              margin: '0 auto 1rem',
            }}
          >
            !
          </div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.5rem' }}>
            مشکلی پیش آمد
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#475569', margin: '0 0 1.5rem' }}>
            خطای غیرمنتظره‌ای رخ داد. لطفاً صفحه را دوباره بارگذاری کنید.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={reset}
              style={{
                padding: '0.625rem 1.5rem',
                background: '#4f46e5',
                color: '#fff',
                border: 'none',
                borderRadius: '0.5rem',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              تلاش مجدد
            </button>
            <a
              href="/"
              style={{
                padding: '0.625rem 1.5rem',
                border: '2px solid #4f46e5',
                color: '#4f46e5',
                borderRadius: '0.5rem',
                fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              بازگشت به خانه
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
