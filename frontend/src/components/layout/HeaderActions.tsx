// src/components/layout/HeaderActions.tsx
"use client";

import Link from "next/link";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { useCartStore } from "@/modules/cart/store/cart.store";
import { useCart } from "@/modules/cart/hooks/useCart";
import { useWishlist } from "@/modules/wishlist/hooks/useWishlist";
import ThemeToggle from "./ThemeToggle";
import AccountMenu from "./AccountMenu";
import {
  LucideLogIn,
  LucideSearch,
  MdiCart,
  MdiHeartOutline,
} from "../icons/Icons";

interface HeaderActionsProps {
  /** Toggles the mobile expandable search row (rendered by Header). */
  onToggleMobileSearch: () => void;
}

function Badge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span
      className="absolute -top-1 -right-1 min-w-[1.125rem] h-[1.125rem] px-1 bg-error text-white
        text-[0.625rem] leading-none rounded-full flex items-center justify-center font-bold"
    >
      {count > 99 ? "۹۹+" : count.toLocaleString("fa-IR")}
    </span>
  );
}

export default function HeaderActions({ onToggleMobileSearch }: HeaderActionsProps) {
  const { isAuthenticated } = useAuth();
  const { openCart } = useCartStore();
  const { cart } = useCart();
  const { data: wishlist } = useWishlist();
  const wishlistCount = wishlist?.length ?? 0;
  const cartCount = cart?.total_items ?? 0;

  const iconBtn =
    "relative inline-flex items-center justify-center w-10 h-10 rounded-button " +
    "text-text-secondary hover:bg-surface-raised hover:text-text-primary transition-colors cursor-pointer";

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      {/* Mobile search toggle */}
      <button
        onClick={onToggleMobileSearch}
        className={`${iconBtn} md:hidden`}
        aria-label="جستجو"
      >
        <LucideSearch className="w-5 h-5" />
      </button>

      {/* Wishlist */}
      <Link href="/wishlist" className={iconBtn} aria-label="علاقه‌مندی‌ها">
        <MdiHeartOutline className="w-6 h-6" />
        <Badge count={wishlistCount} />
      </Link>

      {/* Cart */}
      <button onClick={openCart} className={iconBtn} aria-label="سبد خرید">
        <MdiCart className="w-6 h-6" />
        <Badge count={cartCount} />
      </button>

      <div className="w-px h-6 bg-border mx-1 hidden sm:block" />

      {/* Account */}
      {isAuthenticated ? (
        <AccountMenu />
      ) : (
        <>
          <ThemeToggle />
          <Link
            href="/login"
            className="flex items-center gap-2 px-3 sm:px-4 h-10 bg-primary text-white rounded-button
              hover:bg-primary-hover transition-colors text-sm font-medium"
          >
            <LucideLogIn className="w-5 h-5" />
            <span className="hidden sm:inline">ورود</span>
          </Link>
        </>
      )}
    </div>
  );
}
