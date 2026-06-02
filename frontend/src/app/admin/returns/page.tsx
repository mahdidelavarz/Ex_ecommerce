// src/app/(admin)/admin/returns/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import toast from 'react-hot-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useAdminRoute } from '@/modules/auth/hooks/useAdminRoute';
import AdminSidebar from '@/components/layout/AdminSidebar';
import Button from '@/components/ui/Button';
import { formatPrice } from '@/utils/formatPrice';
import type { ApiResponse } from '@/modules/auth/types/auth.type';

const statusLabels: Record<string, string> = {
  pending: 'در انتظار',
  approved: 'تایید شده',
  rejected: 'رد شده',
  received: 'دریافت شده',
  refunded: 'مسترد شده',
};

const statusColors: Record<string, string> = {
  pending: 'bg-warning-light text-warning',
  approved: 'bg-info-light text-info',
  rejected: 'bg-error-light text-error',
  received: 'bg-primary-light text-primary',
  refunded: 'bg-success-light text-success',
};

export default function AdminReturnsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isLoading: isAuthLoading } = useAdminRoute();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['returns', 'admin', { page, status: statusFilter }],
    queryFn: async () => {
      const params: any = { page, limit: 20 };
      if (statusFilter) params.status = statusFilter;
      const r = await apiClient.get<ApiResponse<any[]> & { meta: any }>('/returns/admin/all', { params });
      return { data: r.data.data, meta: r.data.meta };
    },
  });

  const updateStatus = async (id: string, status: string, refundAmount?: number) => {
    try {
      await apiClient.patch(`/returns/${id}/status`, { status, refund_amount: refundAmount });
      toast.success('وضعیت بروزرسانی شد');
      queryClient.invalidateQueries({ queryKey: ['returns'] });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'خطا');
    }
  };

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
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-text-primary mb-8">مرجوعی‌ها</h1>

          {/* Filters */}
          <div className="bg-surface rounded-card shadow-card p-4 mb-6">
            <div className="flex gap-4">
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="px-4 py-2 bg-surface border border-border rounded-input text-sm"
              >
                <option value="">همه وضعیت‌ها</option>
                {Object.entries(statusLabels).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-surface rounded-card shadow-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-raised">
                  <th className="text-right px-4 py-3">شماره</th>
                  <th className="text-right px-4 py-3 hidden md:table-cell">سفارش</th>
                  <th className="text-right px-4 py-3 hidden lg:table-cell">علت</th>
                  <th className="text-center px-4 py-3">مبلغ</th>
                  <th className="text-center px-4 py-3">وضعیت</th>
                  <th className="text-center px-4 py-3">عملیات</th>
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
                  <tr><td colSpan={6} className="text-center py-12 text-text-secondary">مرجوعی یافت نشد</td></tr>
                ) : (
                  data?.data?.map((ret: any) => (
                    <tr key={ret.id} className="border-b border-border hover:bg-surface-raised/50">
                      <td className="px-4 py-3">
                        <span className="font-medium text-primary">{ret.return_number}</span>
                        <p className="text-xs text-text-muted">
                          {new Date(ret.created_at).toLocaleDateString('fa-IR')}
                        </p>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-text-secondary">
                        {ret.order?.order_number || '-'}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <p className="text-text-secondary text-xs line-clamp-2">{ret.reason}</p>
                      </td>
                      <td className="px-4 py-3 text-center font-medium">
                        {ret.refund_amount > 0 ? formatPrice(ret.refund_amount) : '-'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs ${statusColors[ret.status] || 'bg-warning-light text-warning'}`}>
                          {statusLabels[ret.status] || ret.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-1">
                          {ret.status === 'pending' && (
                            <>
                              <button
                                onClick={() => updateStatus(ret.id, 'approved')}
                                className="px-3 py-1 bg-success-light text-success rounded text-xs hover:bg-success/20"
                              >
                                تایید
                              </button>
                              <button
                                onClick={() => updateStatus(ret.id, 'rejected')}
                                className="px-3 py-1 bg-error-light text-error rounded text-xs hover:bg-error/20"
                              >
                                رد
                              </button>
                            </>
                          )}
                          {ret.status === 'approved' && (
                            <>
                              <button
                                onClick={() => updateStatus(ret.id, 'received')}
                                className="px-3 py-1 bg-primary-light text-primary rounded text-xs"
                              >
                                دریافت شد
                              </button>
                              <button
                                onClick={() => {
                                  const amount = prompt('مبلغ بازگشتی (تومان):');
                                  if (amount) updateStatus(ret.id, 'refunded', parseInt(amount));
                                }}
                                className="px-3 py-1 bg-info-light text-info rounded text-xs"
                              >
                                بازگشت وجه
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => router.push(`/admin/returns/${ret.id}`)}
                            className="px-3 py-1 bg-surface-raised rounded text-xs"
                          >
                            جزئیات
                          </button>
                        </div>
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
              <span className="px-4 py-2 text-sm">{page} از {data.meta.totalPages}</span>
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