// src/app/brands/[slug]/BrandPageClient.tsx
'use client';

import { useCallback } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useBrand } from '@/modules/brands/hooks/useBrands';
import { productService } from '@/modules/products/services/product.service';
import ProductGrid from '@/modules/products/components/ProductGrid';
import { Pagination, Select } from '@/components/ui';
import {
  MdiChevronLeft,
  MdiStore,
  SvgSpinnersRingResize,
} from '@/components/icons/Icons';

export default function BrandPageClient() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = params.slug as string;

  const page = Number(searchParams.get('page')) || 1;
  const sortBy = searchParams.get('sort_by') || 'created_at';
  const sortOrder = (searchParams.get('sort_order') as 'ASC' | 'DESC') || 'DESC';

  const { data: brand, isLoading: isBrandLoading } = useBrand(slug);

  const { data: productsData, isLoading: isProductsLoading } = useQuery({
    queryKey: ['products', 'brand', brand?.id, page, sortBy, sortOrder],
    queryFn: () =>
      productService.list({ brand_id: brand!.id, page, limit: 20, sort_by: sortBy, sort_order: sortOrder }),
    enabled: !!brand?.id,
    staleTime: 2 * 60 * 1000,
  });

  const updateParams = useCallback(
    (updates: Record<string, string | null>, resetPage = true) => {
      const p = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value) p.set(key, value);
        else p.delete(key);
      }
      if (resetPage) p.set('page', '1');
      router.push(`/brands/${slug}?${p.toString()}`);
    },
    [searchParams, router, slug],
  );

  if (isBrandLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <SvgSpinnersRingResize className="text-primary" width={48} />
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <MdiStore className="text-text-muted mx-auto mb-4" width={64} />
          <h1 className="text-xl font-bold text-text-primary mb-2">برند یافت نشد</h1>
          <Link href="/brands" className="text-primary hover:underline">بازگشت به برندها</Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-text-muted mb-6">
          <Link href="/" className="hover:text-primary">خانه</Link>
          <MdiChevronLeft className="w-4 h-4" />
          <Link href="/brands" className="hover:text-primary">برندها</Link>
          <MdiChevronLeft className="w-4 h-4" />
          <span className="text-text-primary">{brand.name}</span>
        </nav>

        {/* Brand Header */}
        <div className="bg-surface rounded-card shadow-card p-6 mb-8">
          <div className="flex items-center gap-6">
            {brand.logo ? (
              <img
                src={brand.logo}
                alt={`لوگوی ${brand.name}`}
                className="w-20 h-20 object-contain border border-border rounded-lg p-2 bg-white shrink-0"
              />
            ) : (
              <div className="w-20 h-20 rounded-xl bg-primary-light flex items-center justify-center shrink-0">
                <span className="text-3xl font-bold text-primary">
                  {brand.name.charAt(0)}
                </span>
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-text-primary">{brand.name}</h1>
              {brand.description && (
                <p className="text-text-secondary mt-1">{brand.description}</p>
              )}
              <p className="text-sm text-text-muted mt-2">{brand.products_count} محصول</p>
            </div>
          </div>
        </div>

        {/* Sort Bar */}
        <div className="flex items-center justify-between mb-6 bg-surface rounded-card shadow-card px-4 py-3">
          <p className="text-sm text-text-secondary">
            {productsData?.meta?.total ?? 0} محصول
          </p>
          <Select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [by, order] = e.target.value.split('-');
              updateParams({ sort_by: by, sort_order: order }, false);
            }}
            wrapperClassName="w-44"
            options={[
              { value: 'created_at-DESC', label: 'جدیدترین' },
              { value: 'created_at-ASC', label: 'قدیمی‌ترین' },
              { value: 'price-ASC', label: 'ارزان‌ترین' },
              { value: 'price-DESC', label: 'گران‌ترین' },
              { value: 'title-ASC', label: 'الفبا (الف-ی)' },
            ]}
          />
        </div>

        {/* Product Grid */}
        <ProductGrid
          products={productsData?.data ?? []}
          isLoading={isProductsLoading}
          emptyMessage="محصولی برای این برند یافت نشد"
        />

        {/* Pagination */}
        {productsData?.meta && (
          <Pagination
            meta={productsData.meta}
            onPageChange={(p) => updateParams({ page: String(p) }, false)}
            itemLabel="محصول"
            className="mt-8"
          />
        )}
      </div>
    </main>
  );
}
