// src/app/search/page.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCategories } from '@/modules/categories/hooks/useCategories';
import { useSearchSuggestions } from '@/modules/search/hooks/useSearchSuggestions';
import { useRecentSearches } from '@/modules/search/hooks/useRecentSearches';
import { formatPrice } from '@/utils/formatPrice';
import { EmptyState, Skeleton } from '@/components/ui';
import {
  LucideSearch,
  MdiArrowRight,
  MdiClose,
  MdiClockOutline,
  MdiTrashCan,
  MdiImageOff,
  MdiTagMultiple,
  MdiTagOff,
} from '@/components/icons/Icons';

/** Curated fallback terms shown alongside category shortcuts. */
const POPULAR_TERMS = ['موبایل', 'لپ‌تاپ', 'هدفون', 'ساعت هوشمند', 'کفش'];

export default function SearchPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [term, setTerm] = useState('');
  const [debounced, setDebounced] = useState('');

  const { recent, add, remove, clear } = useRecentSearches();
  const { data: categoriesRes } = useCategories({ is_active: true, limit: 8 });
  const categories = categoriesRes?.data ?? [];

  // Autofocus on open.
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Debounce the live-suggestions query.
  useEffect(() => {
    const t = setTimeout(() => setDebounced(term), 300);
    return () => clearTimeout(t);
  }, [term]);

  const active = debounced.trim();
  const hasQuery = active.length >= 2;
  const { data: suggestRes, isFetching } = useSearchSuggestions(active);
  const suggestions = suggestRes?.data ?? [];

  function goToResults(raw: string) {
    const q = raw.trim();
    if (!q) return;
    add(q);
    router.push(`/products?search=${encodeURIComponent(q)}`);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    goToResults(term);
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Sticky search bar */}
      <div className="sticky top-0 z-20 bg-surface/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <form onSubmit={onSubmit} role="search" className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.back()}
              aria-label="بازگشت"
              className="shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-button
                text-text-secondary hover:bg-surface-raised hover:text-text-primary transition-colors"
            >
              {/* RTL: back points to the right */}
              <MdiArrowRight className="w-5 h-5" />
            </button>

            <div
              className="group flex items-center flex-1 min-w-0 bg-surface-raised border border-border rounded-input
                ps-3 pe-1.5 h-11 transition-colors
                focus-within:border-primary focus-within:bg-surface focus-within:ring-2 focus-within:ring-primary/25"
            >
              <LucideSearch className="w-5 h-5 text-text-muted shrink-0" aria-hidden="true" />
              <label htmlFor="search-page-input" className="sr-only">
                جستجوی محصولات
              </label>
              <input
                id="search-page-input"
                ref={inputRef}
                type="search"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="جستجوی محصول، برند یا دسته‌بندی…"
                className="flex-1 min-w-0 bg-transparent px-3 text-sm text-text-primary
                  placeholder:text-text-muted outline-none"
                autoComplete="off"
              />
              {term && (
                <button
                  type="button"
                  onClick={() => {
                    setTerm('');
                    inputRef.current?.focus();
                  }}
                  aria-label="پاک کردن"
                  className="shrink-0 p-1.5 rounded-button text-text-muted hover:text-text-primary hover:bg-surface transition-colors"
                >
                  <MdiClose className="w-4 h-4" />
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 pb-28 md:pb-8">
        {hasQuery ? (
          /* ---- Live suggestions ---- */
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => goToResults(active)}
              className="flex items-center gap-3 w-full p-3 rounded-card text-start
                bg-surface-raised hover:bg-surface border border-border transition-colors"
            >
              <LucideSearch className="w-5 h-5 text-primary shrink-0" />
              <span className="text-sm text-text-primary">
                مشاهده همه نتایج «<span className="font-bold">{active}</span>»
              </span>
            </button>

            {isFetching && suggestions.length === 0 ? (
              <div className="space-y-2 pt-1">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex gap-3 p-2">
                    <Skeleton className="w-14 h-14 rounded-lg" />
                    <div className="flex-1 space-y-2 py-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : suggestions.length === 0 ? (
              <EmptyState icon={MdiTagOff} title="نتیجه‌ای یافت نشد">
                <span className="text-text-muted">عبارت دیگری را امتحان کنید.</span>
              </EmptyState>
            ) : (
              <ul className="pt-1">
                {suggestions.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/products/${p.slug}`}
                      onClick={() => add(active)}
                      className="flex items-center gap-3 p-2 rounded-card hover:bg-surface-raised transition-colors"
                    >
                      {p.thumbnail ? (
                        <img
                          src={p.thumbnail}
                          alt={p.title}
                          className="w-14 h-14 rounded-lg object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-surface-raised flex items-center justify-center shrink-0">
                          <MdiImageOff className="w-6 h-6 text-text-muted" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary line-clamp-1">{p.title}</p>
                        {p.category && (
                          <p className="text-xs text-text-muted line-clamp-1">{p.category.name}</p>
                        )}
                      </div>
                      <span className="text-sm font-bold text-text-primary shrink-0">
                        {formatPrice(p.price_range.min)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          /* ---- Recent + trending ---- */
          <div className="space-y-8">
            {recent.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="flex items-center gap-2 text-sm font-bold text-text-primary">
                    <MdiClockOutline className="w-4 h-4 text-text-muted" />
                    جستجوهای اخیر
                  </h2>
                  <button
                    type="button"
                    onClick={clear}
                    className="flex items-center gap-1 text-xs text-text-muted hover:text-error transition-colors"
                  >
                    <MdiTrashCan className="w-3.5 h-3.5" />
                    پاک کردن همه
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recent.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 ps-3 pe-1.5 py-1.5 rounded-full
                        bg-surface-raised border border-border text-sm text-text-secondary"
                    >
                      <button
                        type="button"
                        onClick={() => goToResults(t)}
                        className="hover:text-primary transition-colors"
                      >
                        {t}
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(t)}
                        aria-label={`حذف ${t}`}
                        className="p-0.5 rounded-full text-text-muted hover:text-error hover:bg-surface transition-colors"
                      >
                        <MdiClose className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              </section>
            )}

            <section>
              <h2 className="flex items-center gap-2 text-sm font-bold text-text-primary mb-3">
                <MdiTagMultiple className="w-4 h-4 text-text-muted" />
                جستجوهای پرطرفدار
              </h2>
              <div className="flex flex-wrap gap-2">
                {POPULAR_TERMS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => goToResults(t)}
                    className="px-3 py-1.5 rounded-full bg-surface-raised border border-border
                      text-sm text-text-secondary hover:border-primary hover:text-primary transition-colors"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </section>

            {categories.length > 0 && (
              <section>
                <h2 className="text-sm font-bold text-text-primary mb-3">دسته‌بندی‌ها</h2>
                <div className="flex flex-wrap gap-2">
                  {categories.map((c) => (
                    <Link
                      key={c.id}
                      href={`/products?category=${c.id}`}
                      className="px-3 py-1.5 rounded-full bg-surface-raised border border-border
                        text-sm text-text-secondary hover:border-primary hover:text-primary transition-colors"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
