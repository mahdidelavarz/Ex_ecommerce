// src/app/products/[slug]/page.tsx
'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Icon } from '@iconify/react';
import { useProduct, useRelatedProducts } from '@/modules/products/hooks/useProducts';
import ProductGrid from '@/modules/products/components/ProductGrid';
import { formatPrice } from '@/utils/formatPrice';
import type { ProductVariant } from '@/modules/variants/types/variant.types';

export default function SingleProductPage() {
  const params = useParams();
  const slug = params.slug as string;

  const { data: product, isLoading } = useProduct(slug);
  const { data: relatedProducts } = useRelatedProducts(slug);

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Icon icon="mdi:loading" className="animate-spin text-primary" width={48} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Icon icon="mdi:package-variant-closed" className="text-text-muted mx-auto mb-4" width={64} />
          <h1 className="text-xl font-bold text-text-primary mb-2">محصول یافت نشد</h1>
          <a href="/products" className="text-primary hover:underline">بازگشت به محصولات</a>
        </div>
      </div>
    );
  }

  const currentVariant = selectedVariant || product.variants?.[0];
  const hasDiscount = currentVariant?.compare_at_price && currentVariant.compare_at_price > currentVariant.price;

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-text-muted mb-8">
          <a href="/" className="hover:text-primary">خانه</a>
          <Icon icon="mdi:chevron-left" className="w-4 h-4" />
          {product.category && (
            <>
              <a href={`/categories/${product.category.slug}`} className="hover:text-primary">
                {product.category.name}
              </a>
              <Icon icon="mdi:chevron-left" className="w-4 h-4" />
            </>
          )}
          <span className="text-text-primary truncate">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Images */}
          <div>
            <div className="bg-surface rounded-card shadow-card overflow-hidden mb-4 aspect-square">
              {product.images?.[selectedImage] ? (
                <img
                  src={product.images[selectedImage].image_url}
                  alt={product.images[selectedImage].alt_text || product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-surface-raised">
                  <Icon icon="mdi:image-off" className="w-24 h-24 text-text-muted" />
                </div>
              )}
            </div>
            {product.images?.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-20 h-20 rounded-lg border-2 flex-shrink-0 overflow-hidden ${
                      idx === selectedImage ? 'border-primary' : 'border-border'
                    }`}
                  >
                    <img src={img.image_url} alt={img.alt_text || ''} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            {/* Brand */}
            {product.brand && (
              <div className="flex items-center gap-2 mb-4">
                {product.brand.logo && (
                  <img src={product.brand.logo} alt={product.brand.name} className="w-8 h-8 rounded-lg" />
                )}
                <a href={`/products?brand=${product.brand.id}`} className="text-text-secondary hover:text-primary text-sm">
                  {product.brand.name}
                </a>
              </div>
            )}

            {/* Title */}
            <h1 className="text-2xl font-bold text-text-primary mb-4">{product.title}</h1>

            {/* Short Description */}
            {product.short_description && (
              <p className="text-text-secondary mb-6">{product.short_description}</p>
            )}

            {/* Price */}
            <div className="bg-surface-raised rounded-card p-6 mb-6">
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
                        <Icon icon="mdi:check-circle" className="w-4 h-4" />
                        موجود در انبار
                      </span>
                    ) : (
                      <span className="text-error flex items-center gap-1">
                        <Icon icon="mdi:close-circle" className="w-4 h-4" />
                        ناموجود
                      </span>
                    )}
                  </div>

                  {/* Quantity + Add to Cart */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-border rounded-input">
                      <button
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="p-2 hover:bg-surface-raised"
                      >
                        <Icon icon="mdi:minus" className="w-5 h-5" />
                      </button>
                      <span className="px-4 font-medium">{quantity}</span>
                      <button
                        onClick={() => setQuantity((q) => q + 1)}
                        className="p-2 hover:bg-surface-raised"
                      >
                        <Icon icon="mdi:plus" className="w-5 h-5" />
                      </button>
                    </div>
                    <button
                      disabled={currentVariant.stock_quantity === 0}
                      className="flex-1 bg-primary text-white py-3 px-6 rounded-button font-medium hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                      <Icon icon="mdi:cart-plus" className="w-5 h-5" />
                      افزودن به سبد خرید
                    </button>
                  </div>
                </>
              ) : (
                <p className="text-text-muted">این محصول فاقد واریانت است</p>
              )}
            </div>

            {/* Variants Selection */}
            {product.variants?.length > 0 && (
              <div className="mb-6 space-y-4">
                {/* Group by attribute type */}
                {groupVariantsByAttribute(product.variants).map((group) => (
                  <div key={group.name}>
                    <label className="text-sm font-medium text-text-secondary block mb-2">
                      {group.name}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {group.values.map((val) => (
                        <button
                          key={val.id}
                          onClick={() => {
                            const variant = product.variants.find((v) =>
                              v.attributes.some((a) => a.id === val.id)
                            );
                            if (variant) setSelectedVariant(variant);
                          }}
                          className={`
                            px-4 py-2 rounded-button text-sm font-medium border transition-colors
                            ${currentVariant?.attributes.some((a) => a.id === val.id)
                              ? 'border-primary bg-primary-light text-primary'
                              : 'border-border hover:border-primary text-text-secondary'
                            }
                          `}
                        >
                          {val.color_code && (
                            <span
                              className="inline-block w-3 h-3 rounded-full ms-1"
                              style={{ backgroundColor: val.color_code }}
                            />
                          )}
                          {val.value}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tags */}
            {product.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
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

        {/* Tabs: Description + Specs */}
        <div className="mt-12">
          <div className="bg-surface rounded-card shadow-card overflow-hidden">
            <div className="flex border-b border-border">
              <button className="px-6 py-3 font-medium text-primary border-b-2 border-primary">
                توضیحات
              </button>
              {product.specification && (
                <button className="px-6 py-3 font-medium text-text-secondary hover:text-text-primary">
                  مشخصات فنی
                </button>
              )}
            </div>
            <div className="p-6">
              {product.full_description ? (
                <div
                  className="prose max-w-none text-text-secondary"
                  dangerouslySetInnerHTML={{ __html: product.full_description }}
                />
              ) : (
                <p className="text-text-muted">توضیحاتی برای این محصول ثبت نشده است.</p>
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-bold text-text-primary mb-6">محصولات مرتبط</h2>
            <ProductGrid products={relatedProducts} />
          </section>
        )}
      </div>
    </main>
  );
}

// Helper to group variant attributes
function groupVariantsByAttribute(variants: ProductVariant[]) {
  const allAttrs = variants.flatMap((v) => v.attributes);
  const uniqueNames = [...new Set(allAttrs.map((a) => a.name))];

  return uniqueNames.map((name) => ({
    name,
    values: [...new Map(
      allAttrs
        .filter((a) => a.name === name)
        .map((a) => [a.id, a])
    ).values()],
  }));
}