// src/app/cart/page.tsx
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/modules/cart/hooks/useCart';
import { formatPrice } from '@/utils/formatPrice';
import { Button, Card, EmptyState } from '@/components/ui';
import { useBottomBar } from '@/components/layout/bottom-nav/useBottomBar';
import { MdiCartOff, MdiStore, SvgSpinnersRingResize, MdiTrashCan, MdiImageOff, MdiMinus, LucidePlus, LucideTrash2 } from '../../components/icons/Icons';

export default function CartPage() {
  const router = useRouter();
  const { cart, isLoading, updateItem, removeItem, clearCart } = useCart();

  // Mobile bottom action bar: subtotal + continue to checkout.
  useBottomBar(
    cart && cart.items.length > 0
      ? {
          mode: 'action',
          label: 'ادامه ثبت سفارش',
          total: cart.subtotal,
          onAction: () => router.push('/checkout'),
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

  if (!cart || cart.items.length === 0) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          <EmptyState
            icon={MdiCartOff}
            title="سبد خرید خالی است"
            message="محصولاتی که به سبد خرید اضافه می‌کنید اینجا نمایش داده می‌شوند."
          >
            <Link href="/products">
              <Button icon={MdiStore}>مشاهده محصولات</Button>
            </Link>
          </EmptyState>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-text-primary">سبد خرید</h1>
          <Button variant="ghost" size="sm" icon={MdiTrashCan} onClick={() => clearCart()} className="text-error">
            حذف همه
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <Card key={item.id} className="p-4 flex gap-4">
                <Link href={`/products/${item.variant.product?.slug}`}>
                  {item.variant.image ? (
                    <img src={item.variant.image} alt={item.variant.product?.title} className="w-24 h-24 rounded-lg object-cover" />
                  ) : (
                    <div className="w-24 h-24 rounded-lg bg-surface-raised flex items-center justify-center">
                      <MdiImageOff className="w-10 h-10 text-text-muted" />
                    </div>
                  )}
                </Link>

                <div className="flex-1">
                  <Link href={`/products/${item.variant.product?.slug}`} className="font-medium text-text-primary hover:text-primary">
                    {item.variant.product?.title}
                  </Link>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {item.variant.attributes?.map((attr, i) => (
                      <span key={i} className="text-xs text-text-muted bg-surface-raised px-2 py-0.5 rounded">
                        {attr.name}: {attr.value}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center border border-border rounded">
                      <button
                        onClick={() => updateItem({ itemId: item.id, quantity: Math.max(1, item.quantity - 1) })}
                        className="p-2 hover:bg-surface-raised"
                      >
                        <MdiMinus className="w-4 h-4" />
                      </button>
                      <span className="px-4 font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateItem({ itemId: item.id, quantity: Math.min(item.variant.stock_quantity, item.quantity + 1) })}
                        disabled={item.quantity >= item.variant.stock_quantity}
                        className="p-2 hover:bg-surface-raised disabled:opacity-50"
                      >
                        <LucidePlus className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="text-left">
                      {item.variant.compare_at_price && item.variant.compare_at_price > item.variant.price && (
                        <p className="text-xs text-text-muted line-through">
                          {formatPrice(item.variant.compare_at_price * item.quantity)}
                        </p>
                      )}
                      <span className="font-bold text-text-primary">{formatPrice(item.variant.price * item.quantity)}</span>
                      {item.quantity > 1 && (
                        <p className="text-xs text-text-muted">{formatPrice(item.variant.price)} هر عدد</p>
                      )}
                    </div>
                  </div>
                </div>

                <button onClick={() => removeItem(item.id)} className="self-start p-2 hover:bg-error-light rounded-button text-error">
                  <LucideTrash2 className="w-5 h-5" />
                </button>
              </Card>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h2 className="text-lg font-bold text-text-primary mb-6">خلاصه سفارش</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">تعداد محصولات مختلف:</span>
                  <span>{cart.total_items}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">تعداد واحد:</span>
                  <span>{cart.total_quantity}</span>
                </div>
                <hr className="border-border" />
                <div className="flex justify-between text-lg font-bold">
                  <span>جمع:</span>
                  <span>{formatPrice(cart.subtotal)}</span>
                </div>
              </div>

              {/* On mobile the checkout action lives in the bottom bar */}
              <Link href="/checkout" className="mt-6 hidden md:block">
                <Button className="w-full">ادامه فرایند خرید</Button>
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}