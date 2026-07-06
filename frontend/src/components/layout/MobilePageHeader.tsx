// src/components/layout/MobilePageHeader.tsx
'use client';

import { Fragment } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MdiArrowRight, MdiChevronLeft } from '@/components/icons/Icons';

export interface Crumb {
  label: string;
  href?: string;
}

interface MobilePageHeaderProps {
  items: Crumb[];
  /** Optional slot rendered at the inline-end (e.g. share/wishlist). */
  action?: React.ReactNode;
}

/**
 * Mobile-only sticky sub-header: a back button + truncated breadcrumb.
 * Sits just below the global sticky Header (h-16). Used on the product page.
 */
export default function MobilePageHeader({ items, action }: MobilePageHeaderProps) {
  const router = useRouter();

  return (
    <div
      className="md:hidden sticky top-0 z-20 -mx-4 mb-4 px-3 h-12 flex items-center gap-2
        border-b border-border bg-surface/95 backdrop-blur-md"
    >
      <button
        onClick={() => router.back()}
        className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-button
          text-text-secondary hover:bg-surface-raised hover:text-text-primary transition-colors"
        aria-label="بازگشت"
      >
        {/* RTL: back points to the right */}
        <MdiArrowRight className="w-5 h-5" />
      </button>

      <nav className="flex items-center gap-1 min-w-0 flex-1 text-xs text-text-muted overflow-hidden">
        {items.map((c, i) => {
          const isLast = i === items.length - 1;
          return (
            <Fragment key={i}>
              {c.href && !isLast ? (
                <Link href={c.href} className="hover:text-primary whitespace-nowrap shrink-0">
                  {c.label}
                </Link>
              ) : (
                <span className={`truncate ${isLast ? 'text-text-primary font-medium' : ''}`}>
                  {c.label}
                </span>
              )}
              {!isLast && <MdiChevronLeft className="w-3.5 h-3.5 shrink-0" />}
            </Fragment>
          );
        })}
      </nav>

      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
