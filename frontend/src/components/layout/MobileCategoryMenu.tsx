'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { useCategoryTree } from '@/modules/categories/hooks/useCategories';
import { MdiChevronDown, MdiClose, SvgSpinnersRingResize } from '../icons/Icons';

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

export default function MobileCategoryMenu({ isOpen, onClose }: MobileCategoryMenuProps) {
  const { data: categories, isLoading, isError, refetch } = useCategoryTree();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const isHydrated = useSyncExternalStore(
    subscribeToHydration,
    getHydratedSnapshot,
    getServerHydratedSnapshot
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
        <div
          className="fixed inset-0 z-[90] bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 right-0 z-[100] flex h-dvh w-80 max-w-[calc(100vw-1rem)]
          flex-col overflow-hidden bg-surface shadow-modal lg:hidden
          transform transition-transform duration-300
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
        aria-hidden={!isOpen}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border p-4">
          <h2 className="text-lg font-bold text-text-primary">دسته‌بندی‌ها</h2>
          <button
            onClick={onClose}
            className="rounded-button p-2 transition-colors hover:bg-surface-raised"
            aria-label="بستن منو"
          >
            <MdiClose className="h-6 w-6 text-text-primary" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex h-full items-center justify-center text-primary">
              <SvgSpinnersRingResize className="animate-spin" width={40} />
            </div>
          ) : isError ? (
            <div className="rounded-card bg-surface-raised p-4 text-center">
              <p className="text-sm text-text-secondary">خطا در بارگذاری دسته‌بندی‌ها</p>
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-3 text-sm font-medium text-primary hover:underline"
              >
                تلاش مجدد
              </button>
            </div>
          ) : hasCategories ? (
            categories?.map((category) => {
              const children = category.children ?? [];

              return (
                <div key={category.id} className="mb-2">
                  <div className="flex items-center">
                    <Link
                      href={`/categories/${category.slug}`}
                      onClick={onClose}
                      className="flex flex-1 items-center gap-3 py-3 transition-colors hover:text-primary"
                    >
                      {category.icon && (
                        <Icon icon={category.icon} className="h-5 w-5" />
                      )}
                      <span className="font-medium text-text-primary">{category.name}</span>
                    </Link>
                    {children.length > 0 && (
                      <button
                        onClick={() => toggleCategory(category.id)}
                        className="rounded-button p-2 transition-colors hover:bg-surface-raised"
                        aria-label={expandedCategories.has(category.id) ? 'بستن' : 'باز کردن'}
                      >
                        <MdiChevronDown
                          className={`h-5 w-5 text-text-secondary transition-transform duration-200 ${
                            expandedCategories.has(category.id) ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                    )}
                  </div>

                  {children.length > 0 && expandedCategories.has(category.id) && (
                    <div className="mr-4 animate-fade-in border-r-2 border-border pr-8">
                      {children.map((child) => (
                        <Link
                          key={child.id}
                          href={`/categories/${child.slug}`}
                          onClick={onClose}
                          className="block py-2 text-text-secondary transition-colors hover:text-primary"
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="rounded-card bg-surface-raised p-4 text-center text-sm text-text-secondary">
              دسته‌بندی فعالی یافت نشد
            </div>
          )}
        </div>
      </aside>
    </>,
    document.body
  );
}
