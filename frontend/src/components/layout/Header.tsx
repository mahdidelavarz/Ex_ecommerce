// src/components/layout/Header.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import TopBar from "./TopBar";
import HeaderSearch from "./HeaderSearch";
import HeaderActions from "./HeaderActions";
import CategoryBar from "./CategoryBar";
import MobileCategoryMenu from "./MobileCategoryMenu";
import { useMobileMenuStore } from "./mobileMenu.store";
import { MdiMenu, MdiStore } from "../icons/Icons";

export default function Header() {
  const { isOpen: isMobileMenuOpen, open: openMobileMenu, close: closeMobileMenu } = useMobileMenuStore();
  const [scrolled, setScrolled] = useState(false);

  // Scroll-aware: condense + raise shadow once the page scrolls.
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 8);
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Tier 1 — utility bar (scrolls away) */}
      <TopBar />

      {/* Tiers 2 & 3 — sticky. Sibling of TopBar (not nested) so its sticky
          containing block is <body>, keeping it pinned for the whole page. */}
      <header
        className={`sticky top-0 z-30 bg-surface transition-shadow duration-200 ${
          scrolled ? "shadow-card" : ""
        }`}
      >
        {/* Main bar */}
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 sm:gap-4 h-16">
            {/* Start: mobile menu + logo */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={openMobileMenu}
                className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-button hover:bg-surface-raised transition-colors cursor-pointer"
                aria-label="منو"
              >
                <MdiMenu className="w-6 h-6 text-text-primary" />
              </button>

              <Link href="/" className="flex items-center gap-2" aria-label="نازی‌شاپ">
                <span className="inline-flex items-center justify-center w-9 h-9 rounded-button bg-primary-light text-primary">
                  <MdiStore className="w-5 h-5" />
                </span>
                <span className="text-lg font-bold text-primary hidden sm:inline">
                  نازی‌شاپ
                </span>
              </Link>
            </div>

            {/* Center: inline search (md+) */}
            <div className="hidden md:flex flex-1 justify-center">
              <HeaderSearch className="max-w-xl" />
            </div>

            {/* End: actions */}
            <div className="ms-auto md:ms-0 shrink-0">
              <HeaderActions />
            </div>
          </div>
        </div>

        {/* Tier 3 — category nav bar (hidden once scrolled, desktop only) */}
        {!scrolled && <CategoryBar />}
      </header>

      {/* Mobile category drawer */}
      <MobileCategoryMenu
        isOpen={isMobileMenuOpen}
        onClose={closeMobileMenu}
      />
    </>
  );
}
