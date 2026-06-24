// src/components/ui/Pagination.tsx
// Presentational, server-pagination-agnostic pager.
// Page state lives in the page/hook — this only renders controls and
// reports the requested page via onPageChange. Renders nothing for a
// single page. RTL-aware (prev points right, next points left).
"use client";

import { MdiChevronLeft, MdiChevronRight } from "../icons/Icons";

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
  /** Noun for the summary, e.g. "محصول" → "۱۲۰ محصول". Defaults to "مورد". */
  itemLabel?: string;
  /** Page buttons to show on each side of the current page. Default 2. */
  siblingCount?: number;
  className?: string;
}

/** Inclusive range [start, end] as an array. */
function range(start: number, end: number) {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export default function Pagination({
  meta,
  onPageChange,
  itemLabel = "مورد",
  siblingCount = 2,
  className = "",
}: PaginationProps) {
  const { page, total, totalPages } = meta;

  if (totalPages <= 1) return null;

  const goTo = (p: number) => {
    const next = Math.min(Math.max(1, p), totalPages);
    if (next !== page) onPageChange(next);
  };

  const start = Math.max(1, page - siblingCount);
  const end = Math.min(totalPages, page + siblingCount);
  const pages = range(start, end);

  const navBtn =
    "p-2 rounded-button text-text-secondary transition-colors hover:bg-surface-raised disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent";

  return (
    <div
      className={`flex items-center justify-between gap-3 px-4 py-3 border-t border-border ${className}`}
    >
      <p className="text-sm text-text-secondary">
        {total.toLocaleString("fa-IR")} {itemLabel}
      </p>

      <div className="flex items-center gap-1 sm:gap-2">
        <button
          type="button"
          onClick={() => goTo(page - 1)}
          disabled={page === 1}
          aria-label="صفحه قبل"
          className={navBtn}
        >
          <MdiChevronRight className="w-5 h-5" />
        </button>

        {/* Compact label on the smallest screens */}
        <span className="sm:hidden text-sm text-text-secondary px-1">
          {page.toLocaleString("fa-IR")} / {totalPages.toLocaleString("fa-IR")}
        </span>

        {/* Numbered window on sm+ */}
        <div className="hidden sm:flex items-center gap-1">
          {start > 1 && (
            <>
              <PageButton page={1} current={page} onClick={goTo} />
              {start > 2 && <Ellipsis />}
            </>
          )}

          {pages.map((p) => (
            <PageButton key={p} page={p} current={page} onClick={goTo} />
          ))}

          {end < totalPages && (
            <>
              {end < totalPages - 1 && <Ellipsis />}
              <PageButton page={totalPages} current={page} onClick={goTo} />
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => goTo(page + 1)}
          disabled={page === totalPages}
          aria-label="صفحه بعد"
          className={navBtn}
        >
          <MdiChevronLeft className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

function PageButton({
  page,
  current,
  onClick,
}: {
  page: number;
  current: number;
  onClick: (p: number) => void;
}) {
  const active = page === current;
  return (
    <button
      type="button"
      onClick={() => onClick(page)}
      aria-current={active ? "page" : undefined}
      className={`w-10 h-10 rounded-button text-sm font-medium transition-colors ${
        active
          ? "bg-primary text-white"
          : "text-text-secondary hover:bg-surface-raised"
      }`}
    >
      {page.toLocaleString("fa-IR")}
    </button>
  );
}

function Ellipsis() {
  return (
    <span className="w-8 text-center text-text-muted select-none" aria-hidden>
      …
    </span>
  );
}
