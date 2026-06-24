// src/modules/products/components/ProductGrid.tsx
import ProductCard from './ProductCard';
import type { ProductListResponse } from '../types/product.types';
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
          <div key={i} className="bg-surface rounded-card shadow-card animate-pulse-soft">
            <div className="aspect-[4/5] bg-surface-raised rounded-t-card" />
            <div className="p-4 space-y-2.5">
              <div className="h-3 bg-surface-raised rounded w-1/3" />
              <div className="h-4 bg-surface-raised rounded w-3/4" />
              <div className="h-4 bg-surface-raised rounded w-1/2" />
              <div className="h-11 bg-surface-raised rounded-button mt-3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-20 bg-surface rounded-card shadow-card">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-light mb-5">
          <MdiPackageVariantClosed className="text-primary" width={40} />
        </div>
        <p className="text-text-primary font-medium">{emptyMessage || 'محصولی یافت نشد'}</p>
        <p className="text-text-muted text-sm mt-1">فیلترها را تغییر دهید یا دوباره جستجو کنید</p>
      </div>
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
