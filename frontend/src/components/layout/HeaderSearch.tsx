// src/components/layout/HeaderSearch.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LucideSearch } from "../icons/Icons";

interface HeaderSearchProps {
  /** Auto-focus the input on mount (used by the mobile expandable bar). */
  autoFocus?: boolean;
  /** Called after a successful submit (e.g. to close the mobile search row). */
  onSubmitted?: () => void;
  className?: string;
}

export default function HeaderSearch({
  autoFocus = false,
  onSubmitted,
  className = "",
}: HeaderSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/products?search=${encodeURIComponent(q)}` : "/products");
    onSubmitted?.();
  }

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      className={`group flex items-center w-full bg-surface-raised border border-border rounded-input
        ps-3 pe-1.5 h-11 transition-colors
        focus-within:border-primary focus-within:bg-surface
        focus-within:ring-2 focus-within:ring-primary/25 ${className}`}
    >
      <LucideSearch className="w-5 h-5 text-text-muted shrink-0" aria-hidden="true" />
      <label htmlFor="header-search" className="sr-only">
        جستجوی محصولات
      </label>
      <input
        id="header-search"
        ref={inputRef}
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="جستجوی محصول، برند یا دسته‌بندی…"
        className="flex-1 min-w-0 bg-transparent px-3 text-sm text-text-primary
          placeholder:text-text-muted outline-none"
        autoComplete="off"
      />
      <button
        type="submit"
        aria-label="جستجو"
        className="shrink-0 inline-flex items-center justify-center h-8 px-4 rounded-button
          bg-primary text-white text-sm font-medium hover:bg-primary-hover
          transition-colors cursor-pointer"
      >
        جستجو
      </button>
    </form>
  );
}
