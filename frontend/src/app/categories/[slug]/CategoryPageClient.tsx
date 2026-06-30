// src/app/categories/[slug]/CategoryPageClient.tsx
'use client';

import { useCallback } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useCategory } from '@/modules/categories/hooks/useCategories';
import { productService } from '@/modules/products/services/product.service';
import ProductGrid from '@/modules/products/components/ProductGrid';
import { Pagination, Select } from '@/components/ui';
import { SvgSpinnersRingResize, MdiChevronLeft, MdiFolderOpenOutline } from '@/components/icons/Icons';
import { Icon } from '@iconify/react';
import Link from 'next/link';
import Image from 'next/image';

export default function CategoryPageClient() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = params.slug as string;

  const page = Number(searchParams.get('page')) || 1;
  const sortBy = searchParams.get('sort_by') || 'created_at';
  const sortOrder = (searchParams.get('sort_order') as 'ASC' | 'DESC') || 'DESC';

  const { data: category, isLoading: isCategoryLoading } = useCategory(slug);

  const { data: productsData, isLoading: isProductsLoading } = useQuery({
    queryKey: ['products', 'category', category?.id, page, sortBy, sortOrder],
    queryFn: () => productService.list({ category_id: category!.id, page, limit: 20, sort_by: sortBy, sort_order: sortOrder }),
    enabled: !!category?.id,
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
      router.push(`/categories/${slug}?${p.toString()}`);
    },
    [searchParams, router, slug],
  );

  if (isCategoryLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <SvgSpinnersRingResize className="text-primary" width={48} />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <MdiFolderOpenOutline className="text-text-muted mx-auto mb-4" width={64} />
          <h1 className="text-xl font-bold text-text-primary mb-2">دسته‌بندی یافت نشد</h1>
          <Link href="/products" className="text-primary hover:underline">بازگشت به محصولات</Link>
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
          {category.parent && (
            <>
              <Link href={`/categories/${category.parent.slug}`} className="hover:text-primary">
                {category.parent.name}
              </Link>
              <MdiChevronLeft className="w-4 h-4" />
            </>
          )}
          <span className="text-text-primary">{category.name}</span>
        </nav>

        {/* Compact header: name + count on one side, sort on the other */}
        <div className="flex items-center justify-between gap-3 mb-6 bg-surface rounded-card shadow-card px-4 py-2.5">
          <div className="flex min-w-0 items-center gap-2.5">
            {category.image ? (
              <Image
                src={category.image}
                alt={category.name}
                width={36}
                height={36}
                className="w-9 h-9 rounded-lg object-cover shrink-0"
              />
            ) : category.icon ? (
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: category.color || 'var(--color-primary-light)' }}
              >
                <Icon icon={category.icon} className="w-5 h-5 text-white" />
              </div>
            ) : (
              <div className="w-9 h-9 rounded-lg bg-surface-raised flex items-center justify-center shrink-0">
                <MdiFolderOpenOutline className="text-text-muted" width={20} />
              </div>
            )}
            <h1 className="truncate text-base sm:text-lg font-bold text-text-primary">
              {category.name}
            </h1>
            <span className="shrink-0 text-xs text-text-muted">
              {category.products_count} محصول
            </span>
          </div>

          <Select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [by, order] = e.target.value.split('-');
              updateParams({ sort_by: by, sort_order: order }, false);
            }}
            wrapperClassName="w-36 sm:w-44 shrink-0"
            options={[
              { value: 'created_at-DESC', label: 'جدیدترین' },
              { value: 'created_at-ASC', label: 'قدیمی‌ترین' },
              { value: 'price-ASC', label: 'ارزان‌ترین' },
              { value: 'price-DESC', label: 'گران‌ترین' },
              { value: 'title-ASC', label: 'الفبا (الف-ی)' },
            ]}
          />
        </div>

        {/* Sub-categories */}
        {category.children.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {category.children.map((child) => (
              <Link
                key={child.id}
                href={`/categories/${child.slug}`}
                className="flex items-center gap-2 border border-border rounded-button px-3 py-1.5 text-sm text-text-secondary hover:border-primary hover:text-primary transition-colors"
              >
                {child.image && (
                  <img src={child.image} alt={child.name} className="w-4 h-4 rounded object-cover" />
                )}
                {child.name}
              </Link>
            ))}
          </div>
        )}

        {/* Product Grid */}
        <ProductGrid
          products={productsData?.data ?? []}
          isLoading={isProductsLoading}
          emptyMessage="محصولی در این دسته‌بندی یافت نشد"
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
