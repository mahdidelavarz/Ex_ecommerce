// src/components/layout/HeaderActions.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { useCartStore } from "@/modules/cart/store/cart.store";
import { useCart } from "@/modules/cart/hooks/useCart";
import { useWishlist } from "@/modules/wishlist/hooks/useWishlist";
import AccountMenu from "./AccountMenu";
import {
  LucideLogIn,
  MdiCart,
  MdiHeartOutline,
} from "../icons/Icons";

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

export default function HeaderActions() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const { openCart } = useCartStore();
  const { cart } = useCart();
  const { data: wishlist } = useWishlist();
  const wishlistCount = wishlist?.length ?? 0;
  const cartCount = cart?.total_items ?? 0;

  // The full cart already lives on /cart — don't open the drawer on top of it.
  const onCartClick = () => {
    if (pathname?.startsWith("/cart")) return;
    openCart();
  };

  // Wishlist + cart are duplicated by the mobile bottom nav, so they're
  // desktop-only here; the cart drawer is a desktop quick-peek.
  const iconBtn =
    "relative hidden md:inline-flex items-center justify-center w-10 h-10 rounded-button " +
    "text-text-secondary hover:bg-surface-raised hover:text-text-primary transition-colors cursor-pointer";

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      {/* Wishlist (desktop only — mobile uses the bottom nav) */}
      <Link href="/wishlist" className={iconBtn} aria-label="علاقه‌مندی‌ها">
        <MdiHeartOutline className="w-6 h-6" />
        <Badge count={wishlistCount} />
      </Link>

      {/* Cart (desktop only — mobile uses the bottom nav) */}
      <button onClick={onCartClick} className={iconBtn} aria-label="سبد خرید">
        <MdiCart className="w-6 h-6" />
        <Badge count={cartCount} />
      </button>

      <div className="w-px h-6 bg-border mx-1 hidden sm:block" />

      {/* Account */}
      {isAuthenticated ? (
        <AccountMenu />
      ) : (
        <>
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
