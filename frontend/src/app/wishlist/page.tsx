// src/app/wishlist/page.tsx
'use client';

import Link from 'next/link';
import { Icon } from '@iconify/react';
import { useWishlist, useRemoveFromWishlist } from '@/modules/wishlist/hooks/useWishlist';
import { useCart } from '@/modules/cart/hooks/useCart';
import { formatPrice } from '@/utils/formatPrice';
import WishlistButton from '@/modules/wishlist/components/WishlistButton';

export default function WishlistPage() {
  const { data: wishlist, isLoading } = useWishlist();
  const removeFromWishlist = useRemoveFromWishlist();
  const { addItem } = useCart();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Icon icon="mdi:loading" className="animate-spin text-primary" width={48} />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-3 mb-8">
          <Icon icon="mdi:heart" className="w-8 h-8 text-error" />
          <h1 className="text-2xl font-bold text-text-primary">علاقه‌مندی‌ها</h1>
          <span className="text-text-muted">({wishlist?.length || 0})</span>
        </div>

        {!wishlist || wishlist.length === 0 ? (
          <div className="text-center py-16 bg-surface rounded-card shadow-card">
            <Icon icon="mdi:heart-off" className="text-text-muted mx-auto mb-4" width={64} />
            <p className="text-text-secondary mb-4">لیست علاقه‌مندی‌ها خالی است</p>
            <Link href="/products" className="text-primary hover:underline">مشاهده محصولات</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {wishlist.map((item) => (
              <div key={item.id} className="bg-surface rounded-card shadow-card p-4 flex gap-4">
                <Link href={`/products/${item.variant.product?.slug}`} className="flex-shrink-0">
                  {item.variant.image ? (
                    <img src={item.variant.image} alt={item.variant.product?.title} className="w-24 h-24 rounded-lg object-cover" />
                  ) : (
                    <div className="w-24 h-24 rounded-lg bg-surface-raised flex items-center justify-center">
                      <Icon icon="mdi:image-off" className="w-10 h-10 text-text-muted" />
                    </div>
                  )}
                </Link>

                <div className="flex-1 min-w-0">
                  <Link href={`/products/${item.variant.product?.slug}`} className="font-medium text-text-primary hover:text-primary line-clamp-2">
                    {item.variant.product?.title}
                  </Link>

                  <div className="flex flex-wrap gap-1 mt-1">
                    {item.variant.attributes?.map((attr, i) => (
                      <span key={i} className="text-xs text-text-muted bg-surface-raised px-1.5 py-0.5 rounded">
                        {attr.color_code && <span className="inline-block w-2 h-2 rounded-full me-1" style={{ backgroundColor: attr.color_code }} />}
                        {attr.value}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <span className="font-bold text-text-primary">{formatPrice(item.variant.price)}</span>
                    {item.variant.stock_quantity > 0 && (
                      <button
                        onClick={() => addItem({ variant_id: item.variant_id, quantity: 1 })}
                        className="text-primary text-sm hover:underline"
                      >
                        افزودن به سبد
                      </button>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => removeFromWishlist.mutate(item.id)}
                  className="self-start p-2 hover:bg-error-light rounded-button text-error"
                >
                  <Icon icon="mdi:close" className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}