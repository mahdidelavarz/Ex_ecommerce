// src/components/layout/bottom-nav/ProductBar.tsx
'use client';

import { useState } from 'react';
import { useCart } from '@/modules/cart/hooks/useCart';
import type { CartVariant } from '@/modules/cart/types/cart.types';
import { formatPrice } from '@/utils/formatPrice';
import { Button } from '@/components/ui';
import { LucidePlus, MdiMinus, MdiCartPlus } from '@/components/icons/Icons';

interface ProductBarProps {
  variantId: string;
  price: number;
  comparePrice: number | null;
  stock: number;
  snapshot: CartVariant;
}

/** Sticky purchase bar for the product detail page (mobile). */
export default function ProductBar({ variantId, price, comparePrice, stock, snapshot }: ProductBarProps) {
  const [qty, setQty] = useState(1);
  const { addItem, isAdding } = useCart();

  const isOutOfStock = stock <= 0;
  const hasDiscount = comparePrice != null && comparePrice > price;

  // qty resets to 1 on variant change because <BottomNav /> remounts this
  // component with key={variantId}. Guard against exceeding live stock.
  const cappedQty = Math.min(qty, Math.max(1, stock));

  const handleAdd = () => {
    addItem({ variant_id: variantId, quantity: cappedQty, variant: snapshot });
  };

  return (
    <div className="flex flex-col gap-2.5 px-3 py-2.5">
      {/* Row 1: price + qty stepper */}
      <div className="flex items-center justify-between gap-3">
        {/* Price */}
        <div className="flex flex-col justify-center min-w-0">
          {hasDiscount && (
            <span className="text-[0.7rem] text-text-muted line-through leading-none">
              {formatPrice(comparePrice!)}
            </span>
          )}
          <span className="text-lg font-bold text-text-primary leading-tight truncate">
            {formatPrice(price)}
          </span>
        </div>

        {/* Qty stepper */}
        {!isOutOfStock && (
          <div className="flex items-center border border-border rounded-input shrink-0">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="p-2 hover:bg-surface-raised disabled:opacity-50"
              aria-label="کاهش تعداد"
            >
              <MdiMinus className="w-4 h-4" />
            </button>
            <span className="px-2.5 text-sm font-medium min-w-8 text-center">
              {cappedQty.toLocaleString('fa-IR')}
            </span>
            <button
              onClick={() => setQty((q) => Math.min(stock, q + 1))}
              disabled={cappedQty >= stock}
              className="p-2 hover:bg-surface-raised disabled:opacity-50"
              aria-label="افزایش تعداد"
            >
              <LucidePlus className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Row 2: Add to cart */}
      <Button
        onClick={handleAdd}
        disabled={isOutOfStock || isAdding}
        loading={isAdding}
        icon={MdiCartPlus}
        className="w-full py-2.5!"
      >
        {isOutOfStock ? 'ناموجود' : 'افزودن به سبد'}
      </Button>
    </div>
  );
}
