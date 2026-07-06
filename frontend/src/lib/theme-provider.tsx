'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from 'react';

type Theme = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
}

const STORAGE_KEY = 'theme';
const THEME_CHANGE_EVENT = 'themechange';
const SERVER_SNAPSHOT = 'system:light';
const ThemeContext = createContext<ThemeContextValue | null>(null);

function isTheme(value: string | null): value is Theme {
  return value === 'light' || value === 'dark' || value === 'system';
}

function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'system';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return isTheme(stored) ? stored : 'system';
}

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveTheme(theme: Theme): ResolvedTheme {
  return theme === 'system' ? getSystemTheme() : theme;
}

function applyTheme(theme = getStoredTheme()) {
  if (typeof document === 'undefined') return;
  const resolved = resolveTheme(theme);
  document.documentElement.dataset.theme = resolved;
  document.documentElement.style.colorScheme = resolved;
}

function getSnapshot() {
  const theme = getStoredTheme();
  return `${theme}:${resolveTheme(theme)}`;
}

function getServerSnapshot() {
  return SERVER_SNAPSHOT;
}

function subscribe(callback: () => void) {
  if (typeof window === 'undefined') return () => undefined;

  applyTheme();
  const initialSyncId = window.setTimeout(callback, 0);

  const media = window.matchMedia('(prefers-color-scheme: dark)');
  const handleChange = () => {
    applyTheme();
    callback();
  };
  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) handleChange();
  };

  media.addEventListener('change', handleChange);
  window.addEventListener('storage', handleStorage);
  window.addEventListener(THEME_CHANGE_EVENT, handleChange);

  return () => {
    window.clearTimeout(initialSyncId);
    media.removeEventListener('change', handleChange);
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener(THEME_CHANGE_EVENT, handleChange);
  };
}

function parseSnapshot(snapshot: string): [Theme, ResolvedTheme] {
  const [theme, resolvedTheme] = snapshot.split(':');
  return [
    isTheme(theme) ? theme : 'system',
    resolvedTheme === 'dark' ? 'dark' : 'light',
  ];
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [theme, resolvedTheme] = parseSnapshot(snapshot);

  const setTheme = useCallback((nextTheme: Theme) => {
    if (nextTheme === 'system') {
      window.localStorage.removeItem(STORAGE_KEY);
    } else {
      window.localStorage.setItem(STORAGE_KEY, nextTheme);
    }

    applyTheme(nextTheme);
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  }, []);

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme }),
    [resolvedTheme, setTheme, theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used inside ThemeProvider');
  }

  return context;
}
