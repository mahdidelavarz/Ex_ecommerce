// src/modules/products/components/ProductGrid.tsx
import ProductCard from './ProductCard';
import type { ProductListResponse } from '../types/product.types';
import { Card, EmptyState, Skeleton } from '@/components/ui';
import { MdiPackageVariantClosed } from '@/components/icons/Icons';

interface ProductGridProps {
  products: ProductListResponse[];
  isLoading?: boolean;
  emptyMessage?: string;
  mobileLayout?: 'grid' | 'list';
}

export default function ProductGrid({
  products,
  isLoading,
  emptyMessage,
  mobileLayout = 'grid',
}: ProductGridProps) {
  const gridClass =
    mobileLayout === 'list'
      ? 'grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 md:gap-5 lg:gap-6'
      : 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 lg:gap-6';

  if (isLoading) {
    return (
      <div className={gridClass}>
        {[...Array(8)].map((_, i) => (
          mobileLayout === 'list' ? (
            <Card key={i} className="grid grid-cols-[5rem_minmax(0,1fr)_5.25rem] gap-2.5 rounded-none border-x-0 border-t-0 p-3 shadow-none md:block md:rounded-card md:border-0 md:p-0 md:shadow-card">
              <Skeleton className="aspect-[4/5] rounded-card md:rounded-t-card md:rounded-b-none" />
              <div className="space-y-2 md:p-4">
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
              <div className="self-end space-y-3 md:hidden">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-16" />
              </div>
            </Card>
          ) : (
            <Card key={i}>
              <Skeleton className="aspect-[4/5] rounded-t-card rounded-b-none" />
              <div className="p-4 space-y-2.5">
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/4" />
                <Skeleton className="h-11 rounded-button mt-2" />
              </div>
            </Card>
          )
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <Card className="py-8">
        <EmptyState
          icon={MdiPackageVariantClosed}
          title={emptyMessage || 'محصولی یافت نشد'}
          message="فیلترها را تغییر دهید یا دوباره جستجو کنید"
        />
      </Card>
    );
  }

  return (
    <div className={gridClass}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} mobileLayout={mobileLayout} />
      ))}
    </div>
  );
}
