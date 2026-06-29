// src/components/layout/HeaderSearch.tsx
"use client";

import Link from "next/link";
import { LucideSearch } from "../icons/Icons";

interface HeaderSearchProps {
  className?: string;
}

/**
 * Desktop header search affordance. Styled like an input but acts as a trigger:
 * clicking it routes to the dedicated /search page where typing, live
 * suggestions and recent searches live (single source of truth).
 */
export default function HeaderSearch({ className = "" }: HeaderSearchProps) {
  return (
    <Link
      href="/search"
      role="search"
      aria-label="جستجوی محصولات"
      className={`group flex items-center w-full bg-surface-raised border border-border rounded-input
        ps-3 pe-1.5 h-11 transition-colors
        hover:border-primary hover:bg-surface ${className}`}
    >
      <LucideSearch className="w-5 h-5 text-text-muted shrink-0" aria-hidden="true" />
      <span className="flex-1 min-w-0 px-3 text-sm text-text-muted truncate">
        جستجوی محصول، برند یا دسته‌بندی…
      </span>
      <span
        className="shrink-0 inline-flex items-center justify-center h-8 px-4 rounded-button
          bg-primary text-white text-sm font-medium group-hover:bg-primary-hover transition-colors"
      >
        جستجو
      </span>
    </Link>
  );
}
