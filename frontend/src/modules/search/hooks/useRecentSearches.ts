'use client';

import { useCallback, useSyncExternalStore } from 'react';

const STORAGE_KEY = 'recent-searches';
const MAX_ITEMS = 8;
const EMPTY: string[] = [];

const listeners = new Set<() => void>();

// Cache the parsed array keyed by the raw string so getSnapshot returns a
// stable reference between renders (required by useSyncExternalStore).
let cacheRaw: string | null = null;
let cache: string[] = EMPTY;

function parse(raw: string | null): string[] {
  if (!raw) return EMPTY;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((t): t is string => typeof t === 'string') : EMPTY;
  } catch {
    return EMPTY;
  }
}

function getSnapshot(): string[] {
  if (typeof window === 'undefined') return EMPTY;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw !== cacheRaw) {
    cacheRaw = raw;
    cache = parse(raw);
  }
  return cache;
}

function getServerSnapshot(): string[] {
  return EMPTY;
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) cb();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener('storage', onStorage);
  };
}

function setItems(items: string[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* ignore quota / disabled storage */
  }
  listeners.forEach((l) => l());
}

/**
 * Persisted recent search terms (localStorage). De-duplicated, most-recent-first,
 * capped at MAX_ITEMS. Backed by useSyncExternalStore so it's SSR-safe (server
 * snapshot is empty) and stays in sync across tabs and hook instances.
 */
export function useRecentSearches() {
  const recent = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const add = useCallback((raw: string) => {
    const term = raw.trim();
    if (!term) return;
    const prev = getSnapshot();
    const next = [term, ...prev.filter((t) => t.toLowerCase() !== term.toLowerCase())].slice(0, MAX_ITEMS);
    setItems(next);
  }, []);

  const remove = useCallback((term: string) => {
    setItems(getSnapshot().filter((t) => t !== term));
  }, []);

  const clear = useCallback(() => setItems(EMPTY), []);

  return { recent, add, remove, clear };
}
