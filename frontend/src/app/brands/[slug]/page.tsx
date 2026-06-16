// src/app/brands/[slug]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useBrand } from '@/modules/brands/hooks/useBrands';
import { productService } from '@/modules/products/services/product.service';
import ProductGrid from '@/modules/products/components/ProductGrid';
import { MdiChevronLeft, SvgSpinnersRingResize } from '@/components/icons/Icons';

export default function BrandPage() {
  const params = useParams();
  const slug = params.slug as string;

  const { data: brand, isLoading: isBrandLoading } = useBrand(slug);

  const { data: productsData, isLoading: isProductsLoading } = useQuery({
    queryKey: ['products', 'brand', brand?.id],
    queryFn: () => productService.list({ brand_id: brand?.id, limit: 20 }),
    enabled: !!brand?.id,
    staleTime: 2 * 60 * 1000,
  });

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
        <p className="text-text-secondary">برند یافت نشد</p>
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
          <Link href="/brands" className="hover:text-primary">برندها</Link>
          <MdiChevronLeft className="w-4 h-4 rotate-180" />
          <span className="text-text-primary">{brand.name}</span>
        </nav>

        {/* Brand header */}
        <div className="bg-surface rounded-card shadow-card p-6 mb-8">
          <div className="flex items-center gap-6">
            {brand.logo ? (
              <img
                src={brand.logo}
                alt={brand.name}
                className="w-20 h-20 object-contain border border-border rounded-lg p-2 bg-white flex-shrink-0"
              />
            ) : (
              <div className="w-20 h-20 rounded-xl bg-primary-light flex items-center justify-center flex-shrink-0">
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
            emptyMessage="محصولی برای این برند یافت نشد"
          />
        </div>
      </div>
    </main>
  );
}
