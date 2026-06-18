// src/modules/cart/components/CartDrawer.tsx
'use client';

import Link from 'next/link';
import { useCart } from '../hooks/useCart';
import { useCartStore } from '../store/cart.store';
import { formatPrice } from '@/utils/formatPrice';
import { LucidePlus, LucideTrash2, MdiCartOutline, MdiClose, MdiImageOff, MdiMinus } from '@/components/icons/Icons';

export default function CartDrawer() {
  const { cart, isLoading, updateItem, removeItem } = useCart();
  const { isOpen, closeCart } = useCartStore();

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={closeCart} />

      {/* Drawer */}
      <aside className="fixed top-0 left-0 h-full w-full sm:w-96 bg-surface z-50 shadow-modal animate-slide-in-left">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-bold text-text-primary">
            سبد خرید
            {cart && <span className="text-text-muted text-sm mr-2">({cart.total_items})</span>}
          </h2>
          <button onClick={closeCart} className="p-2 hover:bg-surface-raised rounded-button">
            <MdiClose className="w-6 h-6" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4" style={{ maxHeight: 'calc(100vh - 180px)' }}>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="animate-pulse-soft flex gap-3">
                  <div className="w-20 h-20 bg-surface-raised rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-surface-raised rounded w-3/4" />
                    <div className="h-4 bg-surface-raised rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : !cart || cart.items.length === 0 ? (
            <div className="text-center py-16">
              <MdiCartOutline className="text-text-muted mx-auto mb-4" width={64} />
              <p className="text-text-secondary">سبد خرید خالی است</p>
              <Link
                href="/products"
                onClick={closeCart}
                className="inline-block mt-4 text-primary hover:underline"
              >
                مشاهده محصولات
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.items.map((item) => (
                <div key={item.id} className="flex gap-3 bg-surface-raised rounded-card p-3">
                  {/* Image */}
                  <Link href={`/products/${item.variant.product?.slug}`} onClick={closeCart}>
                    {item.variant.image ? (
                      <img src={item.variant.image} alt={item.variant.product?.title} className="w-20 h-20 rounded-lg object-cover" />
                    ) : (
                      <div className="w-20 h-20 rounded-lg bg-surface flex items-center justify-center">
                        <MdiImageOff className="w-8 h-8 text-text-muted" />
                      </div>
                    )}
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/products/${item.variant.product?.slug}`}
                      onClick={closeCart}
                      className="text-sm font-medium text-text-primary hover:text-primary line-clamp-1"
                    >
                      {item.variant.product?.title}
                    </Link>

                    {/* Attributes */}
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.variant.attributes?.map((attr, i) => (
                        <span key={i} className="text-xs text-text-muted bg-surface px-1.5 py-0.5 rounded">
                          {attr.name}: {attr.value}
                        </span>
                      ))}
                    </div>

                    {/* Quantity + Price */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-border rounded">
                        <button
                          onClick={() => updateItem({ itemId: item.id, quantity: Math.max(1, item.quantity - 1) })}
                          className="p-1 hover:bg-surface"
                        >
                          <MdiMinus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateItem({ itemId: item.id, quantity: Math.min(item.variant.stock_quantity, item.quantity + 1) })}
                          disabled={item.quantity >= item.variant.stock_quantity}
                          className="p-1 hover:bg-surface disabled:opacity-50"
                        >
                          <LucidePlus className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="text-right">
                        {item.variant.compare_at_price && item.variant.compare_at_price > item.variant.price && (
                          <span className="text-xs text-text-muted line-through block">
                            {formatPrice(item.variant.compare_at_price * item.quantity)}
                          </span>
                        )}
                        <span className="text-sm font-bold">{formatPrice(item.variant.price * item.quantity)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="self-start p-1 hover:bg-error-light rounded text-error"
                  >
                    <LucideTrash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart && cart.items.length > 0 && (
          <div className="border-t border-border p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-text-secondary">جمع سبد خرید:</span>
              <span className="text-xl font-bold text-text-primary">{formatPrice(cart.subtotal)}</span>
            </div>
            <Link
              href="/cart"
              onClick={closeCart}
              className="block w-full bg-primary text-white text-center py-3 rounded-button font-medium hover:bg-primary-hover transition-colors"
            >
              مشاهده و ثبت سفارش
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}