// src/components/layout/ThemeToggle.tsx
'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { MdiWeatherSunny, MdiWeatherNight } from '../icons/Icons';

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Avoid hydration mismatch: render a same-size placeholder until mounted.
  if (!mounted) {
    return <div className="w-9 h-9" aria-hidden="true" />;
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="p-2 hover:bg-surface-raised rounded-button transition-colors cursor-pointer"
      aria-label={isDark ? 'حالت روشن' : 'حالت تاریک'}
      title={isDark ? 'حالت روشن' : 'حالت تاریک'}
    >
      {isDark ? (
        <MdiWeatherSunny className="w-5 h-5 text-secondary" />
      ) : (
        <MdiWeatherNight className="w-5 h-5 text-text-secondary" />
      )}
    </button>
  );
}
