// src/components/layout/bottom-nav/BottomNav.tsx
'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useBottomBarStore } from './store';
import DefaultNav from './DefaultNav';
import ProductBar from './ProductBar';
import ActionBar from './ActionBar';

/**
 * Globally-mounted mobile bottom bar. Hidden on admin/auth routes and on
 * screens ≥ md. Renders the variant registered by the current page (or the
 * default quick-nav). In `nav` mode it hides on scroll-down and reveals on
 * scroll-up; the contextual bars stay pinned.
 */
export default function BottomNav() {
  const pathname = usePathname();
  const config = useBottomBarStore((s) => s.config);
  const [hidden, setHidden] = useState(false);

  const isNav = config.mode === 'nav';

  // Hide-on-scroll-down / reveal-on-scroll-up — only for the default nav.
  useEffect(() => {
    if (!isNav) return;
    let lastY = window.scrollY;
    let ticking = false;
    // Ensure the bar is visible when (re)entering nav mode (async — not a
    // synchronous setState in the effect body).
    const initial = requestAnimationFrame(() => setHidden(false));
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (y > lastY + 6 && y > 80) setHidden(true);
        else if (y < lastY - 6) setHidden(false);
        lastY = y;
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(initial);
      window.removeEventListener('scroll', onScroll);
    };
  }, [isNav]);

  // Route-level exclusions (mirror ConditionalFooter).
  if (
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/login') ||
    config.mode === 'hidden'
  ) {
    return null;
  }

  return (
    <div
      className={`md:hidden fixed inset-x-0 bottom-0 z-40 animate-slide-up
        border-t border-border bg-surface/95 backdrop-blur-md
        shadow-[0_-6px_24px_-8px_rgb(142_74_123/0.25)]
        pb-[env(safe-area-inset-bottom)]
        transition-transform duration-300
        ${isNav && hidden ? 'translate-y-full' : 'translate-y-0'}`}
    >
      {config.mode === 'product' ? (
        <ProductBar
          key={config.variantId}
          variantId={config.variantId}
          price={config.price}
          comparePrice={config.comparePrice}
          stock={config.stock}
          snapshot={config.snapshot}
        />
      ) : config.mode === 'action' ? (
        <ActionBar
          label={config.label}
          total={config.total}
          onAction={config.onAction}
          loading={config.loading}
          disabled={config.disabled}
        />
      ) : (
        <DefaultNav />
      )}
    </div>
  );
}
