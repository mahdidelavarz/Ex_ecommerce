'use client';

import { useState } from 'react';
import DOMPurify from 'isomorphic-dompurify';

interface ProductTabsProps {
  fullDescription: string | null;
  specification: Record<string, unknown> | null;
}

type TabId = 'description' | 'specs';

/** Functional tabbed panel: product description + technical specification table. */
export default function ProductTabs({ fullDescription, specification }: ProductTabsProps) {
  const specEntries = specification ? Object.entries(specification) : [];
  const hasSpecs = specEntries.length > 0;

  const tabs: { id: TabId; label: string }[] = [
    { id: 'description', label: 'توضیحات' },
    ...(hasSpecs ? [{ id: 'specs' as const, label: 'مشخصات فنی' }] : []),
  ];

  const [active, setActive] = useState<TabId>('description');

  const onKeyNav = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    const idx = tabs.findIndex((t) => t.id === active);
    // RTL: ArrowLeft advances, ArrowRight goes back.
    const next = e.key === 'ArrowLeft' ? idx + 1 : idx - 1;
    const wrapped = (next + tabs.length) % tabs.length;
    setActive(tabs[wrapped].id);
  };

  return (
    <div className="overflow-hidden rounded-card bg-surface shadow-card">
      <div role="tablist" aria-label="جزئیات محصول" onKeyDown={onKeyNav} className="flex border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={active === tab.id}
            tabIndex={active === tab.id ? 0 : -1}
            onClick={() => setActive(tab.id)}
            className={`relative px-6 py-4 text-sm font-medium transition-colors duration-200 cursor-pointer ${
              active === tab.id
                ? 'text-primary'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {tab.label}
            {active === tab.id && (
              <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-primary" />
            )}
          </button>
        ))}
      </div>

      <div className="p-6">
        {active === 'description' &&
          (fullDescription ? (
            <div
              className="blog-content max-w-none"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(fullDescription) }}
            />
          ) : (
            <p className="text-text-muted">توضیحاتی برای این محصول ثبت نشده است.</p>
          ))}

        {active === 'specs' && hasSpecs && (
          <dl className="overflow-hidden rounded-xl border border-border">
            {specEntries.map(([key, value], i) => (
              <div
                key={key}
                className={`flex flex-col gap-1 px-4 py-3 sm:flex-row sm:gap-4 ${
                  i % 2 === 1 ? 'bg-surface-raised' : ''
                }`}
              >
                <dt className="w-full shrink-0 text-sm font-medium text-text-secondary sm:w-48">
                  {key}
                </dt>
                <dd className="text-sm text-text-primary">{formatSpecValue(value)}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </div>
  );
}

function formatSpecValue(value: unknown): string {
  if (Array.isArray(value)) return value.join('، ');
  if (value === null || value === undefined) return '—';
  if (typeof value === 'object') return Object.values(value as Record<string, unknown>).join('، ');
  return String(value);
}
