// src/app/(profile)/profile/orders/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMyOrders } from '@/modules/orders/hooks/useOrders';
import { formatPrice } from '@/utils/formatPrice';
import { useProtectedRoute } from '@/modules/auth/hooks/useProtectedRoute';
import { MdiChevronLeft, MdiChevronRight, MdiClipboardTextOff, SvgSpinnersRingResize } from '@/components/icons/Icons';

const statusLabels: Record<string, string> = {
  pending: 'در انتظار', confirmed: 'تایید شده', processing: 'در حال پردازش',
  shipped: 'ارسال شده', delivered: 'تحویل شده', cancelled: 'لغو شده', returned: 'مرجوع شده',
};

const statusColors: Record<string, string> = {
  pending: 'bg-warning-light text-warning', confirmed: 'bg-info-light text-info',
  processing: 'bg-info-light text-info', shipped: 'bg-primary-light text-primary',
  delivered: 'bg-success-light text-success', cancelled: 'bg-error-light text-error',
};

export default function ProfileOrdersPage() {
  const { user, isLoading: isAuthLoading } = useProtectedRoute();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useMyOrders({ page, limit: 10 });

  if (isAuthLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <SvgSpinnersRingResize className="animate-spin text-primary" width={48} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Profile Nav */}
      <div className="flex items-center gap-6 mb-8 border-b border-border pb-4">
        <Link href="/profile" className="text-text-secondary hover:text-primary transition-colors">پروفایل</Link>
        <Link href="/profile/orders" className="text-primary font-medium border-b-2 border-primary pb-4 -mb-[17px]">سفارش‌ها</Link>
        <Link href="/profile/addresses" className="text-text-secondary hover:text-primary transition-colors">آدرس‌ها</Link>
      </div>

      <h1 className="text-2xl font-bold text-text-primary mb-8">سفارش‌های من</h1>

      {data?.data?.length === 0 ? (
        <div className="text-center py-16 bg-surface rounded-card shadow-card">
          <MdiClipboardTextOff className="text-text-muted mx-auto mb-4" width={64} />
          <p className="text-text-secondary mb-4">هیچ سفارشی ثبت نشده</p>
          <Link href="/products" className="text-primary hover:underline">مشاهده محصولات</Link>
        </div>
      ) : (
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
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-xs ${statusColors[order.order_status]}`}>
                    {statusLabels[order.order_status]}
                  </span>
                  <span className="font-bold">{formatPrice(order.total_amount)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {data?.meta && data.meta.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 hover:bg-surface rounded-button disabled:opacity-50">
            <MdiChevronRight className="w-5 h-5" />
          </button>
          <span className="px-4 py-2 text-sm">{page} از {data.meta.totalPages}</span>
          <button onClick={() => setPage(p => Math.min(data.meta.totalPages, p + 1))} disabled={page === data.meta.totalPages} className="p-2 hover:bg-surface rounded-button disabled:opacity-50">
            <MdiChevronLeft className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}