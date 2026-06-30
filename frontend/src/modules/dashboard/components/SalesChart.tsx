// src/modules/dashboard/components/SalesChart.tsx
'use client';

import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Skeleton } from '@/components/ui';
import { formatPrice } from '@/utils/formatPrice';
import { toPersianDigits } from '@/utils/toPersianDigits';
import { MdiChartLine } from '@/components/icons/Icons';
import type { SalesSeriesPoint } from '../types/dashboard.types';

function shortDate(value: string): string {
  return new Date(value).toLocaleDateString('fa-IR', { month: 'short', day: 'numeric' });
}

/** Compact toman axis tick: ۱۲٬۰۰۰ → "۱۲ هزار", ۱٬۵۰۰٬۰۰۰ → "۱.۵ م" */
function compactToman(value: number): string {
  if (value >= 1_000_000) return `${toPersianDigits((value / 1_000_000).toFixed(1))} م`;
  if (value >= 1_000) return `${toPersianDigits(Math.round(value / 1_000))} هزار`;
  return toPersianDigits(value);
}

interface TooltipPayloadEntry {
  name: string;
  value: number;
  color: string;
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface border border-border rounded-lg shadow-card px-3 py-2 text-xs" dir="rtl">
      <p className="font-medium text-text-primary mb-1.5">{label ? shortDate(label) : ''}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="flex items-center gap-1.5 text-text-secondary">
          <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
          <span>{entry.name}:</span>
          <span className="font-medium text-text-primary">{formatPrice(entry.value)}</span>
        </p>
      ))}
    </div>
  );
}

export default function SalesChart({
  data,
  loading,
}: {
  data: SalesSeriesPoint[] | undefined;
  loading: boolean;
}) {
  return (
    <div className="bg-surface rounded-card shadow-card p-6">
      <h2 className="font-bold text-text-primary flex items-center gap-2 mb-5">
        <MdiChartLine className="w-5 h-5 text-primary" />
        روند فروش و سود
      </h2>

      {loading ? (
        <Skeleton className="h-72 w-full" />
      ) : !data || data.length === 0 ? (
        <div className="h-72 flex items-center justify-center text-text-muted text-sm">
          داده‌ای برای این بازه وجود ندارد
        </div>
      ) : (
        <div dir="ltr" className="h-72 w-full text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="sellGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis
                dataKey="date"
                tickFormatter={shortDate}
                tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
                stroke="var(--color-border)"
              />
              <YAxis
                tickFormatter={compactToman}
                tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
                stroke="var(--color-border)"
                width={56}
              />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area
                type="monotone"
                dataKey="sell"
                name="فروش"
                stroke="var(--color-primary)"
                strokeWidth={2}
                fill="url(#sellGradient)"
              />
              <Line
                type="monotone"
                dataKey="profit"
                name="سود"
                stroke="var(--color-success)"
                strokeWidth={2}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
