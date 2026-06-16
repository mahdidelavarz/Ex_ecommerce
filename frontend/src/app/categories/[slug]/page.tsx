// src/app/categories/[slug]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useCategory } from '@/modules/categories/hooks/useCategories';
import { productService } from '@/modules/products/services/product.service';
import ProductGrid from '@/modules/products/components/ProductGrid';
import { SvgSpinnersRingResize, MdiChevronLeft } from '@/components/icons/Icons';
import { Icon } from '@iconify/react';

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;

  const { data: category, isLoading: isCategoryLoading } = useCategory(slug);

  const { data: productsData, isLoading: isProductsLoading } = useQuery({
    queryKey: ['products', 'category', category?.id],
    queryFn: () => productService.list({ category_id: category?.id, limit: 20 }),
    enabled: !!category?.id,
    staleTime: 2 * 60 * 1000,
  });

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
        <p className="text-text-secondary">دسته‌بندی یافت نشد</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8" dir="rtl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-text-muted mb-6">
          <Link href="/" className="hover:text-primary">خانه</Link>
          <MdiChevronLeft className="w-4 h-4 rotate-180" />
          {category.parent && (
            <>
              <Link href={`/categories/${category.parent.slug}`} className="hover:text-primary">
                {category.parent.name}
              </Link>
              <MdiChevronLeft className="w-4 h-4 rotate-180" />
            </>
          )}
          <span className="text-text-primary">{category.name}</span>
        </nav>

        {/* Category header */}
        <div className="bg-surface rounded-card shadow-card p-6 mb-8">
          <div className="flex items-center gap-4">
            {category.image ? (
              <img
                src={category.image}
                alt={category.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
            ) : category.icon ? (
              <div
                className="w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: category.color || 'var(--color-primary-light)' }}
              >
                <Icon icon={category.icon} className="w-8 h-8 text-white" />
              </div>
            ) : null}
            <div>
              <h1 className="text-2xl font-bold text-text-primary">{category.name}</h1>
              {category.description && (
                <p className="text-text-secondary mt-1">{category.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Sub-categories */}
        {category.children && category.children.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-text-primary mb-4">زیردسته‌ها</h2>
            <div className="flex gap-3 flex-wrap">
              {category.children.map((child) => (
                <Link
                  key={child.id}
                  href={`/categories/${child.slug}`}
                  className="flex items-center gap-2 border border-border rounded-button px-4 py-2 text-sm text-text-secondary hover:border-primary hover:text-primary transition-colors"
                >
                  {child.image && (
                    <img src={child.image} alt={child.name} className="w-5 h-5 rounded object-cover" />
                  )}
                  {child.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Products */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-text-primary">محصولات</h2>
            {productsData?.meta && (
              <p className="text-sm text-text-secondary">{productsData.meta.total} محصول</p>
            )}
          </div>
          <ProductGrid
            products={productsData?.data || []}
            isLoading={isProductsLoading}
            emptyMessage="محصولی در این دسته‌بندی یافت نشد"
          />
        </div>
      </div>
    </main>
  );
}
