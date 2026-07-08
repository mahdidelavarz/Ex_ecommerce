// src/components/layout/Header.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import TopBar from "./TopBar";
import HeaderSearch from "./HeaderSearch";
import HeaderActions from "./HeaderActions";
import CategoryBar from "./CategoryBar";
import MobileCategoryMenu from "./MobileCategoryMenu";
import { useMobileMenuStore } from "./mobileMenu.store";
import { useAdminMenuStore } from "./adminMenu.store";
import { MdiMenu, MdiStore } from "../icons/Icons";

export default function Header({isOnLanding} : {isOnLanding ?: boolean}) {
  const { isOpen: isMobileMenuOpen, open: openMobileMenu, close: closeMobileMenu } = useMobileMenuStore();
  const openAdminMenu = useAdminMenuStore((s) => s.open);
  const pathname = usePathname();
  // On admin pages, show only the main bar — hide the utility TopBar, the
  // storefront category nav, and the storefront mobile category drawer.
  const isAdmin = pathname?.startsWith("/admin") ?? false;
  const [scrolled, setScrolled] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  // Keep `overflow-hidden` during the collapse animation so the bar clips
  // cleanly; once fully expanded, switch to visible so the hover dropdowns
  // (which overflow below the bar) aren't clipped.
  const [barExpanded, setBarExpanded] = useState(true);
  const shouldCollapseChrome = !isAdmin && isDesktop && scrolled;

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

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

  // Defer overflow:visible until the expand transition (300ms) completes.
  useEffect(() => {
    const t = setTimeout(
      () => setBarExpanded(!shouldCollapseChrome),
      shouldCollapseChrome ? 0 : 300,
    );
    return () => clearTimeout(t);
  }, [shouldCollapseChrome]);

  return (
    <div
      className={`${
        isAdmin
          ? "sticky top-0"
          : isOnLanding
            ? "fixed left-0 right-0 top-0"
            : "sticky top-0"
      } z-50 shadow-[0_14px_40px_-24px_rgb(42_23_38/0.55)] backdrop-blur-md backdrop-saturate-150 supports-[backdrop-filter]:bg-surface/55`}
    >
      {/* Tier 1 — utility bar (scrolls away). Hidden on admin pages. */}
      {!isAdmin && (
        <div
          className={`transition-all duration-300 ease-out ${
            shouldCollapseChrome
              ? "max-h-0 -translate-y-2 overflow-hidden opacity-0"
              : "max-h-10 translate-y-0 overflow-visible opacity-100"
          }`}
        >
          <TopBar />
        </div>
      )}

      {/* Tiers 2 & 3 — sticky. Sibling of TopBar (not nested) so its sticky
          containing block is <body>, keeping it pinned for the whole page. */}
      <header
        className={`sticky top-0 z-30 overflow-visible border-b transition-[background-color,box-shadow,border-color] duration-300 before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-white/50 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-gradient-to-l after:from-transparent after:via-white/45 after:to-transparent ${
          shouldCollapseChrome
            ? "border-white/35 bg-surface/75 shadow-[0_18px_44px_-28px_rgb(42_23_38/0.65)]"
            : "border-white/20 bg-white/10 shadow-none"
        }`}
      >
        {/* Main bar */}
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 sm:gap-4 h-16">
            {/* Start: mobile menu + logo */}
            <div className="flex items-center gap-2 shrink-0">
              {!isAdmin && (
                <button
                  onClick={openMobileMenu}
                  className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-button hover:bg-surface-raised transition-colors cursor-pointer"
                  aria-label="منو"
                >
                  <MdiMenu className="w-6 h-6 text-text-primary" />
                </button>
              )}

              {isAdmin && (
                <button
                  onClick={openAdminMenu}
                  className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-button hover:bg-surface-raised transition-colors cursor-pointer"
                  aria-label="منوی ادمین"
                >
                  <MdiMenu className="w-6 h-6 text-text-primary" />
                </button>
              )}

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

        {/* Tier 3 — category nav bar (collapses once scrolled, desktop only).
            Hidden on admin pages. */}
        {!isAdmin && (
          <div
            className={`transition-all duration-300 ease-out ${
              barExpanded ? "overflow-visible" : "overflow-hidden"
            } ${
              shouldCollapseChrome
                ? "max-h-0 opacity-0 -translate-y-2"
                : "max-h-16 opacity-100 translate-y-0"
            }`}
          >
            <CategoryBar />
          </div>
        )}
      </header>

      {/* Mobile category drawer — storefront only */}
      {!isAdmin && (
        <MobileCategoryMenu
          isOpen={isMobileMenuOpen}
          onClose={closeMobileMenu}
        />
      )}
    </div>
  );
}
