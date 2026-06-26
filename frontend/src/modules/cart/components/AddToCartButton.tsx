// src/modules/cart/components/AddToCartButton.tsx
"use client";

import { useState } from "react";
import { useCart } from "../hooks/useCart";
import type { CartVariant } from "../types/cart.types";
import { Button } from "@/components/ui";
import {
  LucidePlus,
  MdiCartPlus,
  MdiMinus,
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

      <Button
        onClick={handleAddToCart}
        disabled={isOutOfStock || isAdding}
        loading={isAdding}
        icon={MdiCartPlus}
        className="flex-1"
      >
        {isOutOfStock ? "ناموجود" : "افزودن به سبد خرید"}
      </Button>
    </div>
  );
}
