// src/modules/products/components/ProductCard.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/utils/formatPrice';
import { useCart } from '@/modules/cart/hooks/useCart';
import WishlistButton from '@/modules/wishlist/components/WishlistButton';
import type { ProductListResponse } from '../types/product.types';
import {
  LucideStar,
  MdiImageOff,
  MdiCartPlus,
  SvgSpinnersRingResize,
} from '@/components/icons/Icons';

interface ProductCardProps {
  product: ProductListResponse;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem, isAdding } = useCart();

  const hasDiscount = product.has_discount ?? false;
  const minPrice = product.price_range.min;
  const isRange = product.price_range.max > product.price_range.min;
  const outOfStock = product.total_stock === 0;
  const href = `/products/${product.slug}`;

  const canQuickAdd = !!product.default_variant_id && product.default_variant_stock > 0;

  const handleAddToCart = () => {
    if (!product.default_variant_id) return;
    addItem({ variant_id: product.default_variant_id, quantity: 1 });
  };

  return (
    <article className="group relative flex flex-col bg-surface rounded-card shadow-card hover:shadow-card-hover transition-shadow duration-200">
      {/* Wishlist — standalone (not nested in the link) */}
      {product.default_variant_id && (
        <div className="absolute top-3 left-3 z-10">
          <WishlistButton
            variantId={product.default_variant_id}
            size={18}
            className="bg-surface/90 backdrop-blur-sm shadow-card !rounded-full"
          />
        </div>
      )}

      {/* Badges */}
      <div className="absolute top-3 right-3 z-10 flex flex-col items-end gap-1.5">
        {outOfStock && (
          <span className="bg-text-primary/80 text-surface text-[11px] px-2.5 py-1 rounded-full font-medium backdrop-blur-sm">
            ناموجود
          </span>
        )}
        {hasDiscount && !outOfStock && (
          <span className="bg-secondary text-text-primary text-[11px] px-2.5 py-1 rounded-full font-semibold tracking-wide shadow-card">
            تخفیف ویژه
          </span>
        )}
      </div>

      {/* Image */}
      <Link
        href={href}
        className="relative block aspect-[4/5] overflow-hidden rounded-t-card bg-surface-raised"
        aria-label={product.title}
      >
        {product.thumbnail ? (
          <Image
            src={product.thumbnail}
            alt={product.title}
            fill
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <MdiImageOff className="h-14 w-14 text-text-muted" />
          </div>
        )}
        {/* subtle gradient sheen on hover */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-text-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </Link>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        {/* Brand */}
        {product.brand && (
          <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.12em] text-text-muted">
            {product.brand.name}
          </p>
        )}

        {/* Title */}
        <Link href={href}>
          <h3 className="mb-2 line-clamp-2 font-medium leading-relaxed text-text-primary transition-colors group-hover:text-primary">
            {product.title}
          </h3>
        </Link>

        {/* Rating */}
        {product.avg_rating > 0 && (
          <div className="mb-2 flex items-center gap-1 text-xs text-text-muted">
            <LucideStar className="h-3.5 w-3.5 text-secondary" />
            <span className="font-medium text-text-secondary">{product.avg_rating.toFixed(1)}</span>
            <span>({product.reviews_count})</span>
          </div>
        )}

        {/* Price */}
        <div className="mt-auto pt-1">
          {minPrice > 0 ? (
            <div className="flex items-baseline gap-1.5">
              {isRange && <span className="text-xs text-text-muted">از</span>}
              <span className="text-base font-bold text-primary">{formatPrice(minPrice)}</span>
            </div>
          ) : (
            <span className="text-sm font-medium text-text-muted">ناموجود</span>
          )}
        </div>

        {/* Quick add-to-cart */}
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!canQuickAdd || isAdding}
          aria-label="افزودن به سبد خرید"
          className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-button bg-primary text-sm font-medium text-white transition-colors duration-200 hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-surface-raised disabled:text-text-muted cursor-pointer"
        >
          {isAdding ? (
            <SvgSpinnersRingResize className="h-5 w-5" />
          ) : (
            <MdiCartPlus className="h-5 w-5" />
          )}
          {outOfStock || !product.default_variant_id ? 'ناموجود' : 'افزودن به سبد'}
        </button>
      </div>
    </article>
  );
}
