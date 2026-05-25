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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-surface rounded-card shadow-card animate-pulse-soft">
            <div className="aspect-square bg-surface-raised rounded-t-card" />
            <div className="p-4 space-y-2">
              <div className="h-3 bg-surface-raised rounded w-1/3" />
              <div className="h-4 bg-surface-raised rounded w-3/4" />
              <div className="h-4 bg-surface-raised rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <MdiPackageVariantClosed className="text-text-muted mx-auto mb-4" width={64} />
        <p className="text-text-secondary">{emptyMessage || 'محصولی یافت نشد'}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
