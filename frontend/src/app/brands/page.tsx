// src/app/brands/page.tsx
'use client';

import Link from 'next/link';
import { useBrands } from '@/modules/brands/hooks/useBrands';
import { MdiChevronLeft, MdiChevronRight, SvgSpinnersRingResize } from '@/components/icons/Icons';
import { useState } from 'react';

export default function BrandsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useBrands({ page, limit: 24, is_active: true });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <SvgSpinnersRingResize className="text-primary" width={48} />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8" dir="rtl">
        <nav className="flex items-center gap-2 text-sm text-text-muted mb-6">
          <Link href="/" className="hover:text-primary">خانه</Link>
          <MdiChevronLeft className="w-4 h-4 rotate-180" />
          <span className="text-text-primary">برندها</span>
        </nav>

        <h1 className="text-2xl font-bold text-text-primary mb-8">همه برندها</h1>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {data?.data?.map((brand) => (
            <Link
              key={brand.id}
              href={`/brands/${brand.slug}`}
              className="bg-surface border border-border rounded-card p-4 flex flex-col items-center gap-3 hover:border-primary hover:shadow-card transition-all"
            >
              {brand.logo ? (
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="w-16 h-16 object-contain"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-primary-light flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">
                    {brand.name.charAt(0)}
                  </span>
                </div>
              )}
              <span className="text-sm font-medium text-text-primary text-center line-clamp-2">
                {brand.name}
              </span>
              <span className="text-xs text-text-muted">{brand.products_count} محصول</span>
            </Link>
          ))}
        </div>

        {data?.meta && data.meta.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 hover:bg-surface rounded-button disabled:opacity-50"
            >
              <MdiChevronRight className="w-5 h-5" />
            </button>
            {Array.from({ length: data.meta.totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-10 h-10 rounded-button text-sm font-medium ${
                  p === page ? 'bg-primary text-white' : 'hover:bg-surface text-text-secondary'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(data.meta.totalPages, p + 1))}
              disabled={page === data.meta.totalPages}
              className="p-2 hover:bg-surface rounded-button disabled:opacity-50"
            >
              <MdiChevronLeft className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
