// src/modules/dashboard/components/OrderStatusChart.tsx
'use client';

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Skeleton } from '@/components/ui';
import { toPersianDigits } from '@/utils/toPersianDigits';
import { orderStatusBadge } from '@/utils/statusBadge';
import { MdiCart } from '@/components/icons/Icons';

// Distinct colour per order status (aligned with the semantic badge palette).
const STATUS_COLORS: Record<string, string> = {
  pending: '#D97706',
  confirmed: '#0284C7',
  processing: '#8E4A7B',
  shipped: '#6366F1',
  delivered: '#16A34A',
  cancelled: '#DC2626',
  returned: '#A4939C',
};

export default function OrderStatusChart({
  data,
  loading,
}: {
  data: Record<string, number> | undefined;
  loading: boolean;
}) {
  const entries = Object.entries(data ?? {}).filter(([, count]) => count > 0);
  const total = entries.reduce((sum, [, count]) => sum + count, 0);

  const chartData = entries.map(([status, count]) => ({
    status,
    label: orderStatusBadge(status).label,
    count,
    color: STATUS_COLORS[status] ?? '#A4939C',
  }));

  return (
    <div className="bg-surface rounded-card shadow-card p-6">
      <h2 className="font-bold text-text-primary flex items-center gap-2 mb-5">
        <MdiCart className="w-5 h-5 text-primary" />
        وضعیت سفارشات
      </h2>

      {loading ? (
        <Skeleton className="h-72 w-full" />
      ) : chartData.length === 0 ? (
        <div className="h-72 flex items-center justify-center text-text-muted text-sm">
          هنوز سفارشی ثبت نشده است
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <div dir="ltr" className="h-48 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="count"
                  nameKey="label"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={2}
                  stroke="none"
                >
                  {chartData.map((entry) => (
                    <Cell key={entry.status} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [toPersianDigits(Number(value)), String(name)]}
                  contentStyle={{
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-text-primary">{toPersianDigits(total)}</span>
              <span className="text-xs text-text-muted">سفارش</span>
            </div>
          </div>

          <ul className="w-full grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            {chartData.map((entry) => (
              <li key={entry.status} className="flex items-center gap-2 min-w-0">
                <span
                  className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-text-secondary truncate">{entry.label}</span>
                <span className="text-text-primary font-medium mr-auto">{toPersianDigits(entry.count)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
