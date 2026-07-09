// src/modules/products/components/ProductCard.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/utils/formatPrice';
import { toPersianDigits } from '@/utils/toPersianDigits';
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
  mobileLayout?: 'grid' | 'list';
}

export default function ProductCard({ product, mobileLayout = 'grid' }: ProductCardProps) {
  const { addItem, isAdding } = useCart();

  const minPrice = product.price_range.min;
  const isRange = product.price_range.max > product.price_range.min;
  const outOfStock = product.total_stock === 0;
  const href = `/products/${product.slug}`;
  const priceLabel =
    outOfStock || !product.default_variant_id || minPrice <= 0
      ? 'ناموجود'
      : `${isRange ? 'از ' : ''}${formatPrice(minPrice)}`;

  const canQuickAdd = !!product.default_variant_id && product.default_variant_stock > 0;

  const handleAddToCart = () => {
    if (!product.default_variant_id) return;
    addItem({ variant_id: product.default_variant_id, quantity: 1 });
  };

  return (
    <>
      {mobileLayout === 'list' && (
        <article className="group relative grid min-h-32 grid-cols-[5rem_minmax(0,1fr)_5.25rem] gap-2.5 border-b border-border bg-surface py-4 md:hidden">
          <Link
            href={href}
            className="relative block aspect-square overflow-hidden rounded-card bg-surface-raised"
            aria-label={product.title}
          >
            {product.thumbnail ? (
              <Image
                src={product.thumbnail}
                alt={product.title}
                fill
                className="object-contain p-1.5 transition-transform duration-500 ease-out group-hover:scale-105"
                sizes="80px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <MdiImageOff className="h-9 w-9 text-text-muted" />
              </div>
            )}
            {product.discount_percent > 0 && !outOfStock && (
              <span className="absolute bottom-1.5 left-1.5 rounded-full bg-error px-2 py-0.5 text-[10px] font-bold text-white shadow-card">
                {toPersianDigits(product.discount_percent)}٪
              </span>
            )}
          </Link>

          <Link href={href} className="min-w-0 pt-1" aria-label={product.title}>
            {product.brand?.name && (
              <p className="mb-1 truncate text-[11px] font-medium text-text-muted">
                {product.brand.name}
              </p>
            )}
            <h3 className="line-clamp-2 text-sm font-bold leading-7 text-text-primary transition-colors group-hover:text-primary">
              {product.title}
            </h3>
            {product.short_description && (
              <p className="mt-1 line-clamp-2 text-xs leading-6 text-text-secondary">
                {product.short_description}
              </p>
            )}
          </Link>

          <div className="flex min-w-0 flex-col items-end justify-end gap-3 pb-0.5">
            <div className="flex items-center gap-1 text-xs" dir="ltr">
              <LucideStar className="h-4 w-4 fill-secondary text-secondary" />
              <span className="font-bold text-text-primary">
                {toPersianDigits(product.avg_rating ? product.avg_rating.toFixed(1) : '0')}
              </span>
            </div>
            <p className={`whitespace-nowrap text-left text-sm font-extrabold leading-6 ${outOfStock ? 'text-text-muted' : 'text-text-primary'}`}>
              {priceLabel}
            </p>
          </div>
        </article>
      )}

      <article
        className={`group relative h-full flex-col bg-surface rounded-card shadow-card hover:shadow-card-hover transition-shadow duration-200 ${
          mobileLayout === 'list' ? 'hidden md:flex' : 'flex'
        }`}
      >
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
        {product.discount_percent > 0 && !outOfStock && (
          <span className="bg-error text-white text-[11px] px-2 py-1 rounded-full font-bold tracking-wide shadow-card">
            {toPersianDigits(product.discount_percent)}٪
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
        <p className="mb-1 min-h-4 text-[11px] font-medium uppercase tracking-[0.12em] text-text-muted">
          {product.brand?.name}
        </p>

        {/* Title */}
        <div className="mb-3 flex min-h-14 items-start justify-between gap-3" dir="ltr">
          {product.reviews_count > 0 ? (
            <div className="flex shrink-0 items-center gap-1 pt-1 text-xs text-text-muted" dir="ltr">
              <LucideStar className="h-3.5 w-3.5 text-secondary" />
              <span className="font-medium text-text-secondary">
                {toPersianDigits(product.avg_rating.toFixed(1))}
              </span>
            </div>
          ) : (
            <span className="w-9 shrink-0" aria-hidden />
          )}

          <Link href={href} className="min-w-0 flex-1 text-right" dir="rtl">
            <h3 className="line-clamp-2 font-medium leading-relaxed text-text-primary transition-colors group-hover:text-primary">
              {product.title}
            </h3>
          </Link>
        </div>

        {/* Quick add-to-cart — price lives inside the button */}
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!canQuickAdd || isAdding}
          aria-label="افزودن به سبد خرید"
          className="mt-auto flex h-11 w-full items-center justify-center gap-2 rounded-button bg-primary px-3 text-sm font-bold text-white transition-colors duration-200 hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-surface-raised disabled:text-text-muted cursor-pointer"
        >
          {isAdding ? (
            <SvgSpinnersRingResize className="h-5 w-5 shrink-0" />
          ) : (
            <MdiCartPlus className="h-5 w-5 shrink-0" />
          )}
          <span className="truncate">
            {outOfStock || !product.default_variant_id || minPrice <= 0
              ? 'ناموجود'
              : `${isRange ? 'از ' : ''}${formatPrice(minPrice)}`}
          </span>
        </button>
      </div>
      </article>
    </>
  );
}
