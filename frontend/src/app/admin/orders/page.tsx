// src/app/(admin)/admin/orders/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import { useQuery } from '@tanstack/react-query';
import { orderService } from '@/modules/orders/services/order.service';
import { useAdminRoute } from '@/modules/auth/hooks/useAdminRoute';
import AdminSidebar from '@/components/layout/AdminSidebar';
import { formatPrice } from '@/utils/formatPrice';

const statusLabels: Record<string, string> = {
  pending: 'در انتظار', confirmed: 'تایید شده', processing: 'در حال پردازش',
  shipped: 'ارسال شده', delivered: 'تحویل شده', cancelled: 'لغو شده', returned: 'مرجوع شده',
};

const statusColors: Record<string, string> = {
  pending: 'bg-warning-light text-warning', confirmed: 'bg-info-light text-info',
  processing: 'bg-info-light text-info', shipped: 'bg-primary-light text-primary',
  delivered: 'bg-success-light text-success', cancelled: 'bg-error-light text-error',
};

const paymentColors: Record<string, string> = {
  pending: 'bg-warning-light text-warning', paid: 'bg-success-light text-success',
  failed: 'bg-error-light text-error', refunded: 'bg-error-light text-error',
  partially_paid: 'bg-info-light text-info',
};

export default function AdminOrdersPage() {
  const router = useRouter();
  const { isLoading: isAuthLoading } = useAdminRoute();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['orders', 'admin', { page, search, status: statusFilter, payment_status: paymentFilter }],
    queryFn: () => orderService.adminList({
      page, limit: 20,
      search: search || undefined,
      status: statusFilter || undefined,
      payment_status: paymentFilter || undefined,
    }),
  });

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Icon icon="mdi:loading" className="animate-spin text-primary" width={48} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 lg:mr-64 p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-text-primary mb-8">سفارشات</h1>

          {/* Filters */}
          <div className="bg-surface rounded-card shadow-card p-4 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="relative">
                <Icon icon="mdi:search" className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted" width={20} />
                <input
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  placeholder="جستجو..."
                  className="w-full pr-10 pl-4 py-2 bg-surface border border-border rounded-input text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="px-4 py-2 bg-surface border border-border rounded-input text-sm">
                <option value="">همه وضعیت‌ها</option>
                {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <select value={paymentFilter} onChange={(e) => { setPaymentFilter(e.target.value); setPage(1); }} className="px-4 py-2 bg-surface border border-border rounded-input text-sm">
                <option value="">همه پرداخت‌ها</option>
                <option value="pending">در انتظار</option>
                <option value="paid">پرداخت شده</option>
                <option value="failed">ناموفق</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-surface rounded-card shadow-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-raised">
                  <th className="text-right px-4 py-3">شماره سفارش</th>
                  <th className="text-right px-4 py-3 hidden md:table-cell">مشتری</th>
                  <th className="text-center px-4 py-3">مبلغ</th>
                  <th className="text-center px-4 py-3 hidden sm:table-cell">وضعیت</th>
                  <th className="text-center px-4 py-3 hidden sm:table-cell">پرداخت</th>
                  <th className="text-center px-4 py-3 hidden lg:table-cell">تاریخ</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="border-b border-border">
                      <td colSpan={6} className="px-4 py-4"><div className="h-4 bg-surface-raised rounded animate-pulse-soft" /></td>
                    </tr>
                  ))
                ) : data?.data?.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-text-secondary">سفارشی یافت نشد</td></tr>
                ) : (
                  data?.data?.map((order: any) => (
                    <tr
                      key={order.id}
                      onClick={() => router.push(`/admin/orders/${order.id}`)}
                      className="border-b border-border hover:bg-surface-raised/50 cursor-pointer"
                    >
                      <td className="px-4 py-3 font-medium text-primary">{order.order_number}</td>
                      <td className="px-4 py-3 hidden md:table-cell text-text-secondary">
                        {order.user?.full_name || order.customer_phone || '-'}
                      </td>
                      <td className="px-4 py-3 text-center font-bold">{formatPrice(order.total_amount)}</td>
                      <td className="px-4 py-3 text-center hidden sm:table-cell">
                        <span className={`px-2 py-1 rounded-full text-xs ${statusColors[order.order_status]}`}>
                          {statusLabels[order.order_status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center hidden sm:table-cell">
                        <span className={`px-2 py-1 rounded-full text-xs ${paymentColors[order.payment_status] || 'bg-warning-light text-warning'}`}>
                          {order.payment_status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-text-muted hidden lg:table-cell">
                        {new Date(order.created_at).toLocaleDateString('fa-IR')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data?.meta && data.meta.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 hover:bg-surface rounded-button disabled:opacity-50">
                <Icon icon="mdi:chevron-right" className="w-5 h-5" />
              </button>
              {Array.from({ length: data.meta.totalPages }, (_, i) => i + 1)
                .slice(Math.max(0, page - 3), Math.min(data.meta.totalPages, page + 2))
                .map(p => (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-10 h-10 rounded-button text-sm ${p === page ? 'bg-primary text-white' : 'hover:bg-surface'}`}>
                    {p}
                  </button>
                ))}
              <button onClick={() => setPage(p => Math.min(data.meta.totalPages, p + 1))} disabled={page === data.meta.totalPages} className="p-2 hover:bg-surface rounded-button disabled:opacity-50">
                <Icon icon="mdi:chevron-left" className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}