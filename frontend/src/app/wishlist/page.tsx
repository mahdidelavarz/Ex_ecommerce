// src/app/wishlist/page.tsx
'use client';

import Link from 'next/link';

import { useWishlist, useRemoveFromWishlist } from '@/modules/wishlist/hooks/useWishlist';
import { useCart } from '@/modules/cart/hooks/useCart';
import { formatPrice } from '@/utils/formatPrice';
import { Button, Card, EmptyState } from '@/components/ui';
import MobilePageHeader from '@/components/layout/MobilePageHeader';
import { MdiClose, MdiHeartOff, MdiHeartOutline, MdiImageOff, SvgSpinnersRingResize } from '@/components/icons/Icons';


export default function WishlistPage() {
  const { data: wishlist, isLoading } = useWishlist();
  const removeFromWishlist = useRemoveFromWishlist();
  const { addItem } = useCart();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <SvgSpinnersRingResize className="animate-spin text-primary" width={48} />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <MobilePageHeader items={[{ label: 'خانه', href: '/' }, { label: 'علاقه‌مندی‌ها' }]} />

        <div className="flex items-center gap-3 mb-8">
          <MdiHeartOutline className="w-8 h-8 text-error" />
          <h1 className="text-2xl font-bold text-text-primary">علاقه‌مندی‌ها</h1>
          <span className="text-text-muted">({wishlist?.length || 0})</span>
        </div>

        {!wishlist || wishlist.length === 0 ? (
          <Card className="py-4">
            <EmptyState icon={MdiHeartOff} title="لیست علاقه‌مندی‌ها خالی است">
              <Link href="/products">
                <Button variant="outline">مشاهده محصولات</Button>
              </Link>
            </EmptyState>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {wishlist.map((item) => (
              <Card key={item.id} className="p-4 flex gap-4">
                <Link href={`/products/${item.variant.product?.slug}`} className="flex-shrink-0">
                  {item.variant.image ? (
                    <img src={item.variant.image} alt={item.variant.product?.title} className="w-24 h-24 rounded-lg object-cover" />
                  ) : (
                    <div className="w-24 h-24 rounded-lg bg-surface-raised flex items-center justify-center">
                      <MdiImageOff className="w-10 h-10 text-text-muted" />
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
                  <MdiClose className="w-4 h-4" />
                </button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}