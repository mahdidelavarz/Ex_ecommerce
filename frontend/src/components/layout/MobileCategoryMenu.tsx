'use client';

import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { useCategoryTree } from '@/modules/categories/hooks/useCategories';
import type { CategoryTreeNode } from '@/modules/categories/types/category.types';
import {
  LucideSearch,
  MdiChevronDown,
  MdiChevronLeft,
  MdiClose,
  MdiFolderOpenOutline,
  MdiViewGrid,
  SvgSpinnersRingResize,
} from '../icons/Icons';

interface MobileCategoryMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

function subscribeToHydration(callback: () => void) {
  const id = window.setTimeout(callback, 0);
  return () => window.clearTimeout(id);
}

function getHydratedSnapshot() {
  return true;
}

function getServerHydratedSnapshot() {
  return false;
}

function categoryAccent(category: CategoryTreeNode) {
  return category.color || '#8E4A7B';
}

function CategoryIcon({
  category,
  className = 'h-5 w-5',
}: {
  category: CategoryTreeNode;
  className?: string;
}) {
  const accent = categoryAccent(category);

  return (
    <span
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-card border border-white/55 shadow-[inset_0_1px_0_rgb(255_255_255/0.45)]"
      style={{
        backgroundColor: `${accent}18`,
        color: accent,
      }}
    >
      {category.icon ? (
        <Icon icon={category.icon} className={className} />
      ) : (
        <MdiFolderOpenOutline className={className} />
      )}
    </span>
  );
}

function ChildCategoryLink({
  child,
  onClose,
}: {
  child: CategoryTreeNode;
  onClose: () => void;
}) {
  const accent = categoryAccent(child);

  return (
    <Link
      href={`/categories/${child.slug}`}
      onClick={onClose}
      className="group flex items-center justify-between gap-3 rounded-button px-3 py-2.5 text-sm text-text-secondary transition-colors hover:bg-surface hover:text-text-primary"
    >
      <span className="flex min-w-0 items-center gap-2">
        <span
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: accent }}
        />
        <span className="truncate">{child.name}</span>
      </span>
      <MdiChevronLeft className="h-4 w-4 shrink-0 text-text-muted transition-transform group-hover:-translate-x-0.5 group-hover:text-primary" />
    </Link>
  );
}

function LoadingRows() {
  return (
    <div className="space-y-3">
      {[0, 1, 2, 3].map((item) => (
        <div
          key={item}
          className="flex items-center gap-3 rounded-card border border-border bg-surface p-3"
        >
          <div className="h-11 w-11 animate-pulse rounded-card bg-surface-raised" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-28 animate-pulse rounded bg-surface-raised" />
            <div className="h-2 w-20 animate-pulse rounded bg-surface-raised" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function MobileCategoryMenu({ isOpen, onClose }: MobileCategoryMenuProps) {
  const { data: categories, isLoading, isError, refetch } = useCategoryTree();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const isHydrated = useSyncExternalStore(
    subscribeToHydration,
    getHydratedSnapshot,
    getServerHydratedSnapshot
  );

  const totalChildren = useMemo(
    () => categories?.reduce((sum, category) => sum + (category.children?.length ?? 0), 0) ?? 0,
    [categories]
  );

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  const toggleCategory = (id: string) => {
    const newSet = new Set(expandedCategories);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedCategories(newSet);
  };

  if (!isHydrated) return null;

  const hasCategories = (categories?.length ?? 0) > 0;

  return createPortal(
    <>
      {isOpen && (
        <button
          type="button"
          className="fixed inset-0 z-[90] bg-black/45 backdrop-blur-[2px] lg:hidden"
          onClick={onClose}
          aria-label="بستن منوی دسته‌بندی"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 right-0 z-[100] flex h-[100svh] w-[min(24rem,92vw)]
          flex-col overflow-hidden border-l border-white/45 bg-surface shadow-modal lg:hidden
          transform transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0 visible' : 'translate-x-full invisible pointer-events-none'}
        `}
        aria-hidden={!isOpen}
      >
        <div className="shrink-0 border-b border-border bg-surface">
          <div className="relative overflow-hidden px-4 pb-5 pt-4">
            <div className="absolute inset-x-0 top-0 h-28 bg-[linear-gradient(135deg,var(--color-primary-light),var(--color-secondary-light))]" />
            <div className="relative">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-medium text-text-secondary">مرور فروشگاه</p>
                  <h2 className="text-xl font-bold text-text-primary">دسته‌بندی‌ها</h2>
                </div>
                <button
                  onClick={onClose}
                  className="flex h-10 w-10 items-center justify-center rounded-button bg-surface/90 text-text-primary shadow-card transition-colors hover:bg-surface-raised"
                  aria-label="بستن منو"
                >
                  <MdiClose className="h-6 w-6" />
                </button>
              </div>

              <Link
                href="/search"
                onClick={onClose}
                className="flex h-12 items-center gap-3 rounded-card border border-white/70 bg-surface/92 px-4 text-sm text-text-secondary shadow-card transition-colors hover:text-text-primary"
              >
                <LucideSearch className="h-5 w-5 text-primary" />
                <span>جستجو بین محصولات و برندها</span>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 px-4 pb-4">
            <Link
              href="/products"
              onClick={onClose}
              className="flex items-center gap-2 rounded-card border border-border bg-surface-raised px-3 py-3 text-sm font-medium text-text-primary transition-colors hover:border-primary/40"
            >
              <MdiViewGrid className="h-5 w-5 text-primary" />
              همه محصولات
            </Link>
            <div className="rounded-card border border-border bg-surface-raised px-3 py-2.5">
              <p className="text-xs text-text-muted">دسته فعال</p>
              <p className="text-sm font-bold text-text-primary">
                {((categories?.length ?? 0) + totalChildren).toLocaleString('fa-IR')}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-background/70 px-4 py-4">
          {isLoading ? (
            <LoadingRows />
          ) : isError ? (
            <div className="rounded-card border border-border bg-surface p-5 text-center shadow-card">
              <SvgSpinnersRingResize className="mx-auto mb-3 text-primary" width={36} />
              <p className="text-sm text-text-secondary">خطا در بارگذاری دسته‌بندی‌ها</p>
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-4 h-10 rounded-button bg-primary px-4 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
              >
                تلاش مجدد
              </button>
            </div>
          ) : hasCategories ? (
            <div className="space-y-3">
              {categories?.map((category) => {
                const children = category.children ?? [];
                const expanded = expandedCategories.has(category.id);

                return (
                  <section
                    key={category.id}
                    className="overflow-hidden rounded-card border border-border bg-surface shadow-card"
                  >
                    <div className="flex items-center gap-3 p-3">
                      <Link
                        href={`/categories/${category.slug}`}
                        onClick={onClose}
                        className="flex min-w-0 flex-1 items-center gap-3"
                      >
                        <CategoryIcon category={category} />
                        <span className="min-w-0">
                          <span className="block truncate font-bold text-text-primary">
                            {category.name}
                          </span>
                          <span className="block text-xs text-text-muted">
                            {children.length > 0
                              ? `${children.length.toLocaleString('fa-IR')} زیرمجموعه`
                              : 'مشاهده محصولات'}
                          </span>
                        </span>
                      </Link>

                      {children.length > 0 ? (
                        <button
                          type="button"
                          onClick={() => toggleCategory(category.id)}
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-button bg-surface-raised text-text-secondary transition-colors hover:text-primary"
                          aria-label={expanded ? 'بستن' : 'باز کردن'}
                          aria-expanded={expanded}
                        >
                          <MdiChevronDown
                            className={`h-5 w-5 transition-transform duration-200 ${
                              expanded ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                      ) : (
                        <MdiChevronLeft className="h-5 w-5 shrink-0 text-text-muted" />
                      )}
                    </div>

                    {children.length > 0 && expanded && (
                      <div className="border-t border-border bg-surface-raised/70 px-3 py-2 animate-fade-in">
                        <Link
                          href={`/categories/${category.slug}`}
                          onClick={onClose}
                          className="mb-1 flex items-center justify-between rounded-button px-3 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-surface"
                        >
                          همه {category.name}
                          <MdiChevronLeft className="h-4 w-4" />
                        </Link>
                        {children.map((child) => (
                          <ChildCategoryLink key={child.id} child={child} onClose={onClose} />
                        ))}
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          ) : (
            <div className="rounded-card border border-border bg-surface p-5 text-center text-sm text-text-secondary shadow-card">
              دسته‌بندی فعالی یافت نشد
            </div>
          )}
        </div>
      </aside>
    </>,
    document.body
  );
}
