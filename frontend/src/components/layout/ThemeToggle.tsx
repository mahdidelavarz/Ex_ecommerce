// src/components/layout/ThemeToggle.tsx
'use client';

import { useTheme } from '@/lib/theme-provider';
import { MdiWeatherSunny, MdiWeatherNight } from '../icons/Icons';

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
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
