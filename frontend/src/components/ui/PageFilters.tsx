// src/components/ui/PageFilters.tsx
// The standard filters panel under the page header. Children supply the inner
// grid/row of Input/Select widgets (column counts vary per page).
//
// Mobile: collapsed behind a "فیلترها" toggle to reclaim vertical space (the
// header + filters are pinned, so big inputs eat the viewport). Desktop (md+):
// always expanded, no toggle.
"use client";

import { HTMLAttributes, useState } from "react";
import { MdiFilterVariant, MdiChevronDown } from "../icons/Icons";

export interface PageFiltersProps extends HTMLAttributes<HTMLDivElement> {
  /** Optional count of active filters, shown as a badge on the mobile toggle. */
  activeCount?: number;
}

export default function PageFilters({
  className = "",
  activeCount,
  children,
  ...props
}: PageFiltersProps) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`shrink-0 bg-surface rounded-card shadow-card p-3 sm:p-4 mb-3 sm:mb-6 ${className}`}
      {...props}
    >
      {/* Mobile toggle */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="md:hidden w-full flex items-center justify-between gap-2 text-text-secondary cursor-pointer"
      >
        <span className="flex items-center gap-2 font-medium">
          <MdiFilterVariant className="w-5 h-5" />
          فیلترها و جستجو
          {activeCount != null && activeCount > 0 && (
            <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-primary text-white text-xs">
              {activeCount.toLocaleString("fa-IR")}
            </span>
          )}
        </span>
        <MdiChevronDown
          className={`w-5 h-5 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Panel: hidden on mobile until expanded; always visible on md+ */}
      <div className={`${open ? "block mt-3" : "hidden"} md:block md:mt-0`}>
        {children}
      </div>
    </div>
  );
}
