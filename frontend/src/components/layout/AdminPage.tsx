// src/components/layout/AdminPage.tsx
// Shared admin scaffold: sidebar + viewport-locked content column.
// The shell is exactly `100dvh − header` tall (`--header-h` from globals.css +
// 1px header border) and never scrolls the page. The header and filters slots stay
// pinned (shrink-0); only `children` (the table/grid/cards) scrolls. `footer`
// (pagination) stays pinned too.
"use client";

import { ReactNode } from "react";
import AdminSidebar from "./AdminSidebar";
import { SvgSpinnersRingResize } from "../icons/Icons";

type MaxWidth = "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl";

// Static map so Tailwind sees each class literally (interpolated `max-w-${x}`
// would be purged — same lesson as the table `hideBelow` fix).
const maxWidthClass: Record<MaxWidth, string> = {
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
  "5xl": "max-w-5xl",
  "6xl": "max-w-6xl",
  "7xl": "max-w-7xl",
};

export interface AdminPageProps {
  maxWidth?: MaxWidth;
  /** Auth/initial load → full-screen spinner instead of content. */
  loading?: boolean;
  /** Pinned page header (use <PageHeader/>). */
  header?: ReactNode;
  /** Pinned filters area (use <PageFilters/>). */
  filters?: ReactNode;
  /** Pinned footer, e.g. <Pagination/>. */
  footer?: ReactNode;
  /** Scrollable content (table / grid / cards). */
  children: ReactNode;
}

export default function AdminPage({
  maxWidth = "7xl",
  loading = false,
  header,
  filters,
  footer,
  children,
}: AdminPageProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100dvh-var(--header-h)-1px)]">
        <SvgSpinnersRingResize className="text-primary" width={48} />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100dvh-var(--header-h)-1px)] overflow-hidden">
      <AdminSidebar />

      <main className="flex-1 lg:mr-70 flex flex-col min-h-0">
        <div
          className={`${maxWidthClass[maxWidth]} mx-auto w-full flex flex-col flex-1 min-h-0 p-3 sm:p-4 lg:p-8`}
        >
          {header}
          {filters}
          <div className="flex-1 min-h-0 overflow-y-auto">{children}</div>
          {footer && <div className="shrink-0">{footer}</div>}
        </div>
      </main>
    </div>
  );
}
