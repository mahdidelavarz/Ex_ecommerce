// src/modules/cart/components/AddToCartButton.tsx
"use client";

import { useState } from "react";
import { useCart } from "../hooks/useCart";
import type { CartVariant } from "../types/cart.types";
import {
  LucidePlus,
  MdiCartPlus,
  MdiMinus,
  SvgSpinnersRingResize,
} from "@/components/icons/Icons";

interface AddToCartButtonProps {
  variantId: string;
  stockQuantity: number;
  quantity?: number;
  className?: string;
  /** Optional snapshot so a brand-new line item renders optimistically. */
  variantSnapshot?: CartVariant;
}

export default function AddToCartButton({
  variantId,
  stockQuantity,
  quantity = 1,
  className = "",
  variantSnapshot,
}: AddToCartButtonProps) {
  const [qty, setQty] = useState(quantity);
  const { addItem, isAdding } = useCart();

  const isOutOfStock = stockQuantity === 0;

  const handleAddToCart = () => {
    addItem({ variant_id: variantId, quantity: qty, variant: variantSnapshot });
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center border border-border rounded-input">
        <button
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          disabled={isOutOfStock}
          className="p-2 hover:bg-surface-raised disabled:opacity-50"
        >
          <MdiMinus className="w-4 h-4" />
        </button>
        <span className="px-4 text-sm font-medium min-w-10 text-center">
          {qty}
        </span>
        <button
          onClick={() => setQty((q) => Math.min(stockQuantity, q + 1))}
          disabled={isOutOfStock || qty >= stockQuantity}
          className="p-2 hover:bg-surface-raised disabled:opacity-50"
        >
          <LucidePlus className="w-4 h-4" />
        </button>
      </div>

      <button
        onClick={handleAddToCart}
        disabled={isOutOfStock || isAdding}
        className="flex-1 bg-primary text-white py-3 px-6 rounded-button font-medium hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {isAdding ? (
          <SvgSpinnersRingResize className="w-5 h-5" />
        ) : (
          <MdiCartPlus className="w-5 h-5" />
        )}
        {isOutOfStock ? "ناموجود" : "افزودن به سبد خرید"}
      </button>
    </div>
  );
}
