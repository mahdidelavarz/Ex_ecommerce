// src/app/products/[slug]/ProductPageClient.tsx
'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useProduct, useRelatedProducts } from '@/modules/products/hooks/useProducts';
import ProductGrid from '@/modules/products/components/ProductGrid';
import ProductGallery from '@/modules/products/components/ProductGallery';
import VariantSelector from '@/modules/products/components/VariantSelector';
import ProductTabs from '@/modules/products/components/ProductTabs';
import TrustBadges from '@/modules/products/components/TrustBadges';
import AddToCartButton from '@/modules/cart/components/AddToCartButton';
import { formatPrice } from '@/utils/formatPrice';
import type { ProductVariant } from '@/modules/variants/types/variant.types';
import {
  MdiCheckCircle,
  MdiCloseCircle,
  MdiChevronLeft,
  MdiPackageVariantClosed,
  SvgSpinnersRingResize,
} from '@/components/icons/Icons';
import { StarRating } from '@/components/ui';
import ReviewsSection from '@/modules/reviews/components/ReviewsSection';
import WishlistButton from '@/modules/wishlist/components/WishlistButton';
import MobilePageHeader from '@/components/layout/MobilePageHeader';
import { useBottomBar } from '@/components/layout/bottom-nav/useBottomBar';
import type { CartVariant } from '@/modules/cart/types/cart.types';

export default function ProductPageClient() {
  const params = useParams();
  const slug = params.slug as string;

  const { data: product, isLoading } = useProduct(slug);
  const { data: relatedProducts } = useRelatedProducts(slug);

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  // Compute the active variant before any early return so the bottom-bar hook
  // is called unconditionally (rules of hooks). `product` may be undefined
  // while loading — guarded with optional chaining.
  const activeVariants = product?.variants?.filter((v) => v.is_active) ?? [];
  const currentVariant = selectedVariant ?? activeVariants[0] ?? null;
  const hasDiscount =
    currentVariant != null &&
    currentVariant.compare_at_price != null &&
    currentVariant.compare_at_price > currentVariant.price;

  // Register the mobile purchase bar (or fall back to the default nav).
  useBottomBar(
    currentVariant && product
      ? {
          mode: 'product',
          variantId: currentVariant.id,
          price: currentVariant.price,
          comparePrice: currentVariant.compare_at_price,
          stock: currentVariant.stock_quantity,
          snapshot: buildVariantSnapshot(currentVariant, product),
        }
      : { mode: 'nav' },
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <SvgSpinnersRingResize className="  text-primary" width={48} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <MdiPackageVariantClosed className="text-text-muted mx-auto mb-4" width={64} />
          <h1 className="text-xl font-bold text-text-primary mb-2">محصول یافت نشد</h1>
          <Link href="/products" className="text-primary hover:underline">بازگشت به محصولات</Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Mobile sticky sub-header: back + breadcrumb */}
        <MobilePageHeader
          items={[
            { label: 'خانه', href: '/' },
            ...(product.category
              ? [{ label: product.category.name, href: `/categories/${product.category.slug}` }]
              : []),
            { label: product.title },
          ]}
        />

        {/* Breadcrumb (desktop) */}
        <nav className="hidden md:flex items-center gap-2 text-sm text-text-muted mb-8">
          <Link href="/" className="hover:text-primary">خانه</Link>
          <MdiChevronLeft className="w-4 h-4" />
          {product.category && (
            <>
              <a href={`/categories/${product.category.slug}`} className="hover:text-primary">
                {product.category.name}
              </a>
              <MdiChevronLeft className="w-4 h-4" />
            </>
          )}
          <span className="text-text-primary truncate">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-12">
          {/* Gallery */}
          <ProductGallery images={product.images} title={product.title} />

          {/* Info */}
          <div>
            {/* Brand */}
            {product.brand && (
              <div className="flex items-center gap-2 mb-4">
                {product.brand.logo && (
                  <div className="relative w-8 h-8 rounded-lg overflow-hidden">
                    <Image src={product.brand.logo} alt={product.brand.name} fill className="object-contain" sizes="32px" />
                  </div>
                )}
                <a href={`/brands/${product.brand.slug}`} className="text-text-secondary hover:text-primary text-sm">
                  {product.brand.name}
                </a>
              </div>
            )}

            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-bold text-text-primary leading-snug mb-3">
              {product.title}
            </h1>

            {/* Rating */}
            {product.reviews_count > 0 && (
              <a href="#reviews" className="group mb-4 inline-flex items-center gap-2">
                <StarRating rating={Math.round(product.avg_rating)} size={18} />
                <span className="text-sm font-medium text-text-primary">
                  {product.avg_rating.toFixed(1)}
                </span>
                <span className="text-sm text-text-muted group-hover:text-primary transition-colors">
                  ({product.reviews_count} نظر)
                </span>
              </a>
            )}

            {/* Short Description */}
            {product.short_description && (
              <p className="text-text-secondary leading-relaxed mb-6">{product.short_description}</p>
            )}

            {/* Sticky buy box (desktop) */}
            <div className="lg:sticky lg:top-24 space-y-6">
              {/* Variants Selection */}
              <VariantSelector
                variants={activeVariants}
                current={currentVariant}
                onSelect={setSelectedVariant}
              />

              {/* Price + purchase */}
              <div className="bg-surface-raised rounded-card p-6">
                {currentVariant ? (
                  <>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-3xl font-bold text-text-primary">
                        {formatPrice(currentVariant.price)}
                      </span>
                      {hasDiscount && (
                        <span className="text-lg text-text-muted line-through">
                          {formatPrice(currentVariant.compare_at_price!)}
                        </span>
                      )}
                      {hasDiscount && (
                        <span className="bg-success text-white text-sm px-2 py-1 rounded-full">
                          {Math.round(((currentVariant.compare_at_price! - currentVariant.price) / currentVariant.compare_at_price!) * 100)}%
                        </span>
                      )}
                    </div>

                    {/* Stock status */}
                    <div className="flex items-center gap-2 text-sm mb-4">
                      {currentVariant.stock_quantity > 0 ? (
                        <span className="text-success flex items-center gap-1">
                          <MdiCheckCircle className="w-4 h-4" />
                          موجود در انبار
                        </span>
                      ) : (
                        <span className="text-error flex items-center gap-1">
                          <MdiCloseCircle className="w-4 h-4" />
                          ناموجود
                        </span>
                      )}
                    </div>

                    {/* Add to Cart — hidden on mobile (replaced by the bottom bar) */}
                    <div className="flex items-center gap-3">
                      <div className="hidden md:flex flex-1">
                        <AddToCartButton
                          variantId={currentVariant.id}
                          stockQuantity={currentVariant.stock_quantity}
                          variantSnapshot={buildVariantSnapshot(currentVariant, product)}
                          className="flex-1"
                        />
                      </div>
                      <WishlistButton variantId={currentVariant.id} />
                    </div>
                  </>
                ) : (
                  <p className="text-text-muted">این محصول فاقد واریانت است</p>
                )}
              </div>

              {/* Trust badges */}
              <TrustBadges />

              {/* Tags */}
              {product.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <a
                      key={tag.id}
                      href={`/products?tag=${tag.slug}`}
                      className="bg-surface-raised px-3 py-1 rounded-full text-xs text-text-secondary hover:text-primary transition-colors"
                    >
                      {tag.name}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs: Description + Specs */}
        <div className="mt-12">
          <ProductTabs
            fullDescription={product.full_description}
            specification={product.specification}
          />
        </div>

        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-bold text-text-primary mb-6">محصولات مرتبط</h2>
            <ProductGrid products={relatedProducts} />
          </section>
        )}
      </div>

      {/* Reviews anchor target */}
      <div id="reviews" className="scroll-mt-24">
        <div className="container mx-auto px-4">
          <ReviewsSection productId={product.id} />
        </div>
      </div>
    </main>
  );
}

/** Builds the optimistic cart-variant snapshot shared by the in-page button
 *  and the mobile bottom purchase bar. */
function buildVariantSnapshot(
  variant: ProductVariant,
  product: { id: string; title: string; slug: string; images?: { image_url: string }[] },
): CartVariant {
  return {
    id: variant.id,
    sku: variant.sku,
    price: variant.price,
    compare_at_price: variant.compare_at_price,
    stock_quantity: variant.stock_quantity,
    is_active: variant.is_active,
    attributes: variant.attributes.map((a) => ({
      name: a.name,
      value: a.value,
      color_code: a.color_code,
    })),
    image:
      variant.images?.find((img) => img.sort_order === 0)?.image_url ??
      variant.images?.[0]?.image_url ??
      product.images?.[0]?.image_url ??
      null,
    product: {
      id: product.id,
      title: product.title,
      slug: product.slug,
      is_active: true,
    },
  };
}
