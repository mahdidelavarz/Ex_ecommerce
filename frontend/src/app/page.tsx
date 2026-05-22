// src/app/page.tsx
'use client';

import { useAuth } from '@/modules/auth/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Icon } from '@iconify/react';
import Link from 'next/link';

export default function HomePage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Icon icon="mdi:loading" className="animate-spin text-primary" width={48} />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="bg-surface rounded-2xl shadow-card p-8 max-w-2xl mx-auto text-center">
          <Icon icon="mdi:check-circle" className="text-success mx-auto mb-4" width={64} />
          <h1 className="text-2xl font-bold text-text-primary mb-4">
            خوش آمدید، {user?.full_name}!
          </h1>
          <p className="text-text-secondary mb-8">
            فروشگاه نازی شاپ در حال راه‌اندازی است. به زودی محصولات جدید اضافه خواهند شد.
          </p>
          
          <div className="flex gap-4 justify-center">
            <Link
              href="/profile"
              className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-button hover:bg-primary-hover transition-colors font-medium"
            >
              <Icon icon="mdi:account" width={20} />
              پروفایل
            </Link>
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 border border-error text-error px-6 py-3 rounded-button hover:bg-error-light transition-colors font-medium"
            >
              <Icon icon="mdi:logout" width={20} />
              خروج
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}