// src/modules/cart/components/AddToCartButton.tsx
"use client";

import { useState } from "react";
import { useCart } from "../hooks/useCart";
import { useAuthStore } from "@/modules/auth/store/auth.store";
import { useRouter } from "next/navigation";
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
}

export default function AddToCartButton({
  variantId,
  stockQuantity,
  quantity = 1,
  className = "",
}: AddToCartButtonProps) {
  const [qty, setQty] = useState(quantity);
  const { addItem, isAdding } = useCart();
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  const isOutOfStock = stockQuantity === 0;

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    addItem({ variant_id: variantId, quantity: qty });
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
        <span className="px-4 text-sm font-medium min-w-[40px] text-center">
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
