// src/modules/products/components/ProductCard.tsx
import Link from 'next/link';
import { formatPrice } from '@/utils/formatPrice';
import type { ProductListResponse } from '../types/product.types';
import { LucideStar, MdiImageOff } from '@/components/icons/Icons';

interface ProductCardProps {
  product: ProductListResponse;
}

export default function ProductCard({ product }: ProductCardProps) {
  const hasDiscount = product.price_range.min < product.price_range.max;
  const minPrice = product.price_range.min;
  const maxPrice = product.price_range.max;

  return (
    <article className="bg-surface rounded-card shadow-card hover:shadow-card-hover transition-all duration-200 group">
      <Link href={`/products/${product.slug}`} className="block">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden rounded-t-card bg-surface-raised">
          {product.thumbnail ? (
            <img
              src={product.thumbnail}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <MdiImageOff className="w-16 h-16 text-text-muted" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            {product.total_stock === 0 && (
              <span className="bg-error text-white text-xs px-2 py-1 rounded-full font-medium">
                ناموجود
              </span>
            )}
            {hasDiscount && product.total_stock > 0 && (
              <span className="bg-success text-white text-xs px-2 py-1 rounded-full font-medium">
                تخفیف
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Brand */}
          {product.brand && (
            <p className="text-xs text-text-muted mb-1">{product.brand.name}</p>
          )}

          {/* Title */}
          <h3 className="font-medium text-text-primary line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {product.title}
          </h3>

          {/* Price */}
          <div className="flex items-center gap-2">
            {hasDiscount ? (
              <>
                <span className="text-sm font-bold text-text-primary">
                  {formatPrice(minPrice)}
                </span>
                <span className="text-xs text-text-muted line-through">
                  {formatPrice(maxPrice)}
                </span>
              </>
            ) : (
              <span className="text-sm font-bold text-text-primary">
                {minPrice > 0 ? formatPrice(minPrice) : 'ناموجود'}
              </span>
            )}
          </div>

          {/* Rating & Reviews */}
          {product.avg_rating > 0 && (
            <div className="flex items-center gap-1 mt-2 text-xs text-text-muted">
              <LucideStar className="w-4 h-4 text-warning" />
              <span>{product.avg_rating.toFixed(1)}</span>
              <span>({product.reviews_count})</span>
            </div>
          )}
        </div>
      </Link>
    </article>
  );
}