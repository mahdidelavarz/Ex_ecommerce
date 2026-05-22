// src/components/layout/Header.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import MegaMenu from './MegaMenu';
import MobileCategoryMenu from './MobileCategoryMenu';

export default function Header() {
  const { user, isAuthenticated } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-surface border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Mobile Menu Toggle */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 hover:bg-surface-raised rounded-button transition-colors"
              aria-label="منو"
            >
              <Icon icon="mdi:menu" className="w-6 h-6 text-text-primary" />
            </button>
            <Link href="/" className="text-xl font-bold text-primary">
              نازی شاپ
            </Link>
          </div>

          {/* Desktop Navigation */}
          <MegaMenu />

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <Link
              href="/search"
              className="p-2 hover:bg-surface-raised rounded-button transition-colors"
              aria-label="جستجو"
            >
              <Icon icon="mdi:search" className="w-5 h-5 text-text-secondary" />
            </Link>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="p-2 hover:bg-surface-raised rounded-button transition-colors"
              aria-label="علاقه‌مندی‌ها"
            >
              <Icon icon="mdi:heart-outline" className="w-5 h-5 text-text-secondary" />
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className="p-2 hover:bg-surface-raised rounded-button transition-colors relative"
              aria-label="سبد خرید"
            >
              <Icon icon="mdi:cart-outline" className="w-5 h-5 text-text-secondary" />
            </Link>

            {/* User */}
            {isAuthenticated ? (
              <Link
                href="/profile"
                className="flex items-center gap-2 px-3 py-2 hover:bg-surface-raised rounded-button transition-colors"
              >
                <Icon icon="mdi:account-circle" className="w-5 h-5 text-text-secondary" />
                <span className="text-sm text-text-secondary hidden md:inline">
                  {user?.full_name?.split(' ')[0]}
                </span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-button hover:bg-primary-hover transition-colors text-sm font-medium"
              >
                <Icon icon="mdi:login" className="w-5 h-5" />
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