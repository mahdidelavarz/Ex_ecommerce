// src/components/layout/bottom-nav/ActionBar.tsx
'use client';

import { formatPrice } from '@/utils/formatPrice';
import { Button } from '@/components/ui';

interface ActionBarProps {
  label: string;
  total?: number;
  onAction: () => void;
  loading?: boolean;
  disabled?: boolean;
}

/** Total + single primary action — used on cart & checkout (mobile). */
export default function ActionBar({ label, total, onAction, loading, disabled }: ActionBarProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 h-17">
      {total !== undefined && (
        <div className="flex flex-col justify-center min-w-0">
          <span className="text-[0.7rem] text-text-muted leading-none mb-0.5">قابل پرداخت</span>
          <span className="text-base font-bold text-text-primary leading-tight truncate">
            {formatPrice(total)}
          </span>
        </div>
      )}
      <Button
        onClick={onAction}
        loading={loading}
        disabled={disabled}
        size="md"
        className="flex-1 py-2.5!"
      >
        {label}
      </Button>
    </div>
  );
}
