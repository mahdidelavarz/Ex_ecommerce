// src/app/orders/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMyOrders } from '@/modules/orders/hooks/useOrders';
import { formatPrice } from '@/utils/formatPrice';
import { MdiClipboardTextOff, MdiChevronLeft, MdiChevronRight } from '@/components/icons/Icons';

const statusLabels: Record<string, string> = {
  pending: 'در انتظار', confirmed: 'تایید شده', processing: 'در حال پردازش',
  shipped: 'ارسال شده', delivered: 'تحویل شده', cancelled: 'لغو شده', returned: 'مرجوع شده',
};

const statusColors: Record<string, string> = {
  pending: 'bg-warning-light text-warning', confirmed: 'bg-info-light text-info',
  processing: 'bg-info-light text-info', shipped: 'bg-primary-light text-primary',
  delivered: 'bg-success-light text-success', cancelled: 'bg-error-light text-error',
  returned: 'bg-error-light text-error',
};

export default function MyOrdersPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const { data, isLoading } = useMyOrders({ page, limit: 10, status: statusFilter || undefined });

  const totalPages = data?.meta?.totalPages ?? 1;

  const handleStatusChange = (v: string) => {
    setStatusFilter(v);
    setPage(1);
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-text-primary">سفارش‌های من</h1>
          <select
            value={statusFilter}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="px-3 py-2 bg-surface border border-border rounded-input text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">همه وضعیت‌ها</option>
            {Object.entries(statusLabels).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-surface rounded-card shadow-card p-6 animate-pulse-soft">
                <div className="h-4 bg-surface-raised rounded w-1/4 mb-2" />
                <div className="h-3 bg-surface-raised rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : data?.data?.length === 0 ? (
          <div className="text-center py-16">
            <MdiClipboardTextOff className="text-text-muted mx-auto mb-4" width={64} />
            <p className="text-text-secondary">هیچ سفارشی یافت نشد</p>
            <Link href="/products" className="inline-block mt-4 text-primary hover:underline">
              مشاهده محصولات
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {data?.data?.map((order) => (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="block bg-surface rounded-card shadow-card hover:shadow-card-hover transition-all p-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-text-primary">{order.order_number}</p>
                      <p className="text-sm text-text-muted mt-1">
                        {new Date(order.created_at).toLocaleDateString('fa-IR')} | {order.items_count} قلم
                      </p>
                    </div>
                    <div className="text-left flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.order_status]}`}>
                        {statusLabels[order.order_status]}
                      </span>
                      <span className="font-bold text-text-primary">{formatPrice(order.total_amount)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 hover:bg-surface rounded-button disabled:opacity-40"
                >
                  <MdiChevronRight className="w-5 h-5" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .slice(Math.max(0, page - 3), Math.min(totalPages, page + 2))
                  .map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-10 h-10 rounded-button text-sm ${p === page ? 'bg-primary text-white' : 'hover:bg-surface-raised'}`}
                    >
                      {p}
                    </button>
                  ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 hover:bg-surface rounded-button disabled:opacity-40"
                >
                  <MdiChevronLeft className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
