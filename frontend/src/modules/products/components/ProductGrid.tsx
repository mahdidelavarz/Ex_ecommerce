// src/modules/products/components/ProductGrid.tsx
import ProductCard from './ProductCard';
import type { ProductListResponse } from '../types/product.types';
import { Card, EmptyState, Skeleton } from '@/components/ui';
import { MdiPackageVariantClosed } from '@/components/icons/Icons';

interface ProductGridProps {
  products: ProductListResponse[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export default function ProductGrid({ products, isLoading, emptyMessage }: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 lg:gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i}>
            <Skeleton className="aspect-[4/5] rounded-t-card rounded-b-none" />
            <div className="p-4 space-y-2.5">
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-11 rounded-button mt-3" />
            </div>
          </Card>
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
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 lg:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
