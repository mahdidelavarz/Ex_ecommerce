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
 * screens >= md. The default nav hides on scroll-down and reveals on scroll-up;
 * contextual bars stay pinned.
 */
export default function BottomNav() {
  const pathname = usePathname();
  const config = useBottomBarStore((s) => s.config);
  const [hidden, setHidden] = useState(false);

  const isNav = config.mode === 'nav';

  useEffect(() => {
    if (!isNav) {
      const reset = requestAnimationFrame(() => setHidden(false));
      return () => cancelAnimationFrame(reset);
    }

    let lastY = window.scrollY;
    let ticking = false;
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

  if (
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/login') ||
    config.mode === 'hidden'
  ) {
    return null;
  }

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-50 animate-slide-up border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-6px_24px_-8px_rgb(142_74_123/0.25)] backdrop-blur-md transition-transform duration-300 md:hidden ${
        isNav && hidden ? 'translate-y-full' : 'translate-y-0'
      }`}
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
