// src/modules/dashboard/components/KpiCard.tsx
'use client';

import { SVGProps } from 'react';
import { Skeleton } from '@/components/ui';

export interface KpiCardProps {
  label: string;
  value: string | number;
  icon: (props: SVGProps<SVGSVGElement>) => React.ReactElement;
  /** Tailwind classes for the icon chip, e.g. "text-success bg-success-light". */
  color?: string;
  /** Optional secondary line under the value. */
  sublabel?: string;
  loading?: boolean;
  /** Emphasise the card with a tinted border (used for the headline profit KPI). */
  highlight?: boolean;
}

export default function KpiCard({
  label,
  value,
  icon: Icon,
  color = 'text-primary bg-primary-light',
  sublabel,
  loading = false,
  highlight = false,
}: KpiCardProps) {
  return (
    <div
      className={`bg-surface rounded-card shadow-card p-5 flex items-center gap-4 hover:shadow-card-hover transition-shadow ${
        highlight ? 'ring-1 ring-success/40' : ''
      }`}
    >
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="w-7 h-7" />
      </div>
      <div className="min-w-0">
        <p className="text-text-muted text-xs mb-1.5">{label}</p>
        {loading ? (
          <Skeleton className="h-7 w-24" />
        ) : (
          <p className="text-2xl font-bold text-text-primary truncate">{value}</p>
        )}
        {sublabel && !loading && <p className="text-xs text-text-muted mt-1 truncate">{sublabel}</p>}
      </div>
    </div>
  );
}
