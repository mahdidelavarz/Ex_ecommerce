// src/components/layout/Header.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import MegaMenu from "./MegaMenu";
import MobileCategoryMenu from "./MobileCategoryMenu";
import ThemeToggle from "./ThemeToggle";
import {
  LucideLogIn,
  LucideSearch,
  MdiAccountCircle,
  MdiCart,
  MdiCartOutline,
  MdiHeartOutline,
  MdiMenu,
  MdiViewDashboard,
} from "../icons/Icons";
import { useCartStore } from "@/modules/cart/store/cart.store";
import { useCart } from "@/modules/cart/hooks/useCart";
import { useWishlist } from "@/modules/wishlist/hooks/useWishlist";

export default function Header() {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { openCart } = useCartStore();
  const { cart } = useCart();
  const { data: wishlist } = useWishlist();
  const wishlistCount = wishlist?.length ?? 0;

  return (
    <header className="sticky top-0 z-30 bg-surface border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-[var(--header-h)]">
          {/* Logo & Mobile Menu Toggle */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 hover:bg-surface-raised rounded-button transition-colors"
              aria-label="منو"
            >
              <MdiMenu className="w-6 h-6 text-text-primary" />
            </button>
            <Link href="/" className="text-xl font-bold text-primary">
              نازی شاپ
            </Link>
          </div>

          {/* Desktop Navigation */}
          <MegaMenu />

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <ThemeToggle />

            {/* Search */}
            <Link
              href="/search"
              className="p-2 hover:bg-surface-raised rounded-button transition-colors"
              aria-label="جستجو"
            >
              <LucideSearch className="w-5 h-5 text-text-secondary" />
            </Link>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="p-2 hover:bg-surface-raised rounded-button transition-colors relative"
              aria-label="علاقه‌مندی‌ها"
            >
              <MdiHeartOutline className="w-5 h-5 text-text-secondary" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-error text-white text-xs rounded-full flex items-center justify-center font-medium">
                  {wishlistCount > 99 ? '99+' : wishlistCount}
                </span>
              )}
            </Link>

            {/* Admin panel — only for admins */}
            {isAdmin && (
              <Link
                href="/admin/categories"
                className="p-2 hover:bg-surface-raised rounded-button transition-colors"
                aria-label="پنل مدیریت"
                title="پنل مدیریت"
              >
                <MdiViewDashboard className="w-5 h-5 text-text-secondary" />
              </Link>
            )}

            {/* Cart */}
            <button
              onClick={openCart}
              className="p-2 hover:bg-surface-raised rounded-button transition-colors relative"
              aria-label="سبد خرید"
            >
              <MdiCart
                className="w-5 h-5 text-text-secondary"
              />
              {cart && cart.total_items > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-error text-white text-xs rounded-full flex items-center justify-center font-medium">
                  {cart.total_items}
                </span>
              )}
            </button>

            {/* User */}
            {isAuthenticated ? (
              <Link
                href="/profile"
                className="flex items-center gap-2 px-3 py-2 hover:bg-surface-raised rounded-button transition-colors"
              >
                <MdiAccountCircle className="w-5 h-5 text-text-secondary" />
                <span className="text-sm text-text-secondary hidden md:inline">
                  {user?.full_name?.split(" ")[0]}
                </span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-button hover:bg-primary-hover transition-colors text-sm font-medium"
              >
                <LucideLogIn className="w-5 h-5" />
                <span className="hidden md:inline">ورود</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <MobileCategoryMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </header>
  );
}
