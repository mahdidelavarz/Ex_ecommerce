// src/components/layout/AdminFormLayout.tsx
// Shared admin *form* scaffold (the create/edit counterpart to AdminPage).
//
// Like AdminPage, the shell is exactly `100dvh − header` tall (`--header-h`
// from globals.css + 1px header border) and never scrolls the page. The whole
// thing is a single <form> laid out as a flex column with three regions:
//
//   • Pinned header  (shrink-0) — back button + title/subtitle.
//   • Scrollable body (flex-1 overflow-y-auto) — a responsive grid: a wide main
//     column (`children`, lg:col-span-2) and an optional narrow `aside`
//     (lg:col-span-1) that stacks under the main column below `lg`.
//   • Pinned action bar (shrink-0) — Cancel + Save (submit). Always visible so
//     the primary actions never scroll away. `secondaryActions` (e.g. Delete)
//     render on the opposite edge.
//
// Usage:
//   <AdminFormLayout
//     title={isEdit ? 'ویرایش' : 'جدید'}
//     loading={isAuthLoading}
//     onBack={() => router.back()}
//     onSubmit={handleSubmit(onSubmit)}
//     isSubmitting={isSubmitting}
//     submitLabel={isEdit ? 'بروزرسانی' : 'ایجاد'}
//     aside={<FormSection ...>...</FormSection>}
//   >
//     <FormSection ...>...</FormSection>
//   </AdminFormLayout>
"use client";

import { FormEventHandler, ReactNode } from "react";
import AdminSidebar from "./AdminSidebar";
import { Button } from "../ui";
import { MdiArrowRight, SvgSpinnersRingResize } from "../icons/Icons";

type MaxWidth = "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "full";

// Static map so Tailwind sees each class literally (interpolated `max-w-${x}`
// would be purged — same lesson as AdminPage / the table `hideBelow` fix).
const maxWidthClass: Record<MaxWidth, string> = {
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
  "5xl": "max-w-5xl",
  "6xl": "max-w-6xl",
  "7xl": "max-w-7xl",
  "full" : 'w-full'
};

export interface AdminFormLayoutProps {
  title: string;
  subtitle?: string;
  /** Back button handler (e.g. router.back()). Hidden if omitted. */
  onBack?: () => void;
  /** Auth/initial load → full-screen spinner instead of the form. */
  loading?: boolean;
  /** Form submit handler — pass `handleSubmit(onSubmit)` from react-hook-form. */
  onSubmit: FormEventHandler<HTMLFormElement>;
  /** Disables + spins the Save button and disables Cancel while true. */
  isSubmitting?: boolean;
  submitLabel: string;
  cancelLabel?: string;
  /** Narrow side column (status / organization / preview). */
  aside?: ReactNode;
  /** Extra actions pinned to the opposite edge of the action bar (e.g. Delete). */
  secondaryActions?: ReactNode;
  maxWidth?: MaxWidth;
  /** Wide main column content. */
  children: ReactNode;
}

export default function AdminFormLayout({
  title,
  subtitle,
  onBack,
  loading = false,
  onSubmit,
  isSubmitting = false,
  submitLabel,
  cancelLabel = "انصراف",
  aside,
  secondaryActions,
  maxWidth = "full",
  children,
}: AdminFormLayoutProps) {
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

      <main className="flex-1 lg:mr-64 flex flex-col min-h-0">
        <form
          onSubmit={onSubmit}
          className={`${maxWidthClass[maxWidth]} mx-auto w-full flex flex-col flex-1 min-h-0`}
        >
          {/* Pinned header */}
          <div className="shrink-0 flex items-center gap-6 px-4 lg:px-16 pt-8 pb-4">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                aria-label="بازگشت"
                className="p-2 -mr-2 rounded-button text-text-secondary bg-surface-raised hover:text-text-primary transition-colors cursor-pointer"
              >
                <MdiArrowRight className="w-5 h-5" />
              </button>
            )}
            <div className="min-w-0">
              <h1 className="text-xl lg:text-2xl font-bold text-text-primary truncate">
                {title}
              </h1>
              {subtitle && (
                <p className="text-sm text-text-secondary truncate">{subtitle}</p>
              )}
            </div>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 min-h-0 overflow-y-auto px-4 lg:px-8 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              <div className={`space-y-6 ${aside ? "lg:col-span-2" : "lg:col-span-3"}`}>
                {children}
              </div>
              {aside && (
                <aside className="lg:col-span-1 space-y-6 lg:sticky lg:top-0">
                  {aside}
                </aside>
              )}
            </div>
          </div>

          {/* Pinned action bar */}
          <div className="shrink-0 z-10 border-t border-border  ">
            <div className="px-4 lg:px-8 py-5 flex items-center justify-center gap-3">
              <Button type="submit" loading={isSubmitting} className="flex-1 sm:flex-initial md:w-60">
                {submitLabel}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                disabled={isSubmitting}
                className="flex-1 sm:flex-initial md:w-60"
              >
                {cancelLabel}
              </Button>
              {secondaryActions && (
                <div className="ms-auto flex items-center gap-3">{secondaryActions}</div>
              )}
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
