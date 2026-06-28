// src/components/layout/bottom-nav/useBottomBar.ts
'use client';

import { useEffect } from 'react';
import { useBottomBarStore, type BottomBarConfig } from './store';

/**
 * Registers a page-specific configuration for the global mobile bottom bar.
 *
 * The config is re-synced on every render so closures (e.g. `onAction`) and
 * primitive fields (`loading`, `disabled`, `total`, `price`) always stay fresh.
 * This is safe and loop-free because the calling page does not subscribe to the
 * bottom-bar store — only the globally-mounted <BottomNav /> does, so updating
 * the store re-renders the bar, never the page.
 *
 * On unmount the bar falls back to the default quick-nav. App Router runs the
 * leaving page's cleanup before the entering page's effect, so route changes
 * transition back to `nav` cleanly.
 */
export function useBottomBar(config: BottomBarConfig) {
  const setConfig = useBottomBarStore((s) => s.setConfig);
  const reset = useBottomBarStore((s) => s.reset);

  // Keep the store in sync with the latest config on each render.
  useEffect(() => {
    setConfig(config);
  });

  // Restore the default nav when the registering page unmounts.
  useEffect(() => {
    return () => reset();
  }, [reset]);
}
