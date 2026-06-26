// src/app/(admin)/admin/returns/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useAdminRoute } from '@/modules/auth/hooks/useAdminRoute';
import AdminSidebar from '@/components/layout/AdminSidebar';
import {
  Badge,
  Input,
  Pagination,
  Select,
  Table,
  TBody,
  TD,
  TableEmpty,
  TableSkeleton,
  TH,
  THead,
  TRow,
} from '@/components/ui';
import { formatPrice } from '@/utils/formatPrice';
import { returnStatusBadge } from '@/utils/statusBadge';
import type { ApiResponse } from '@/modules/auth/types/auth.type';
import { MdiKeyboardReturn, SvgSpinnersRingResize } from '@/components/icons/Icons';

const statusOptions = [
  { value: 'pending', label: 'در انتظار' },
  { value: 'approved', label: 'تایید شده' },
  { value: 'rejected', label: 'رد شده' },
  { value: 'received', label: 'دریافت شده' },
  { value: 'refunded', label: 'مسترد شده' },
];

export default function AdminReturnsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isLoading: isAuthLoading } = useAdminRoute();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [refundAmounts, setRefundAmounts] = useState<Record<string, string>>({});

  const { data, isLoading } = useQuery({
    queryKey: ['returns', 'admin', { page, status: statusFilter }],
    queryFn: async () => {
      const params: any = { page, limit: 20 };
      if (statusFilter) params.status = statusFilter;
      const r = await apiClient.get<ApiResponse<any[]> & { meta: any }>('/returns/admin/all', { params });
      return { data: r.data.data, meta: r.data.meta };
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, refundAmount }: { id: string; status: string; refundAmount?: number }) =>
      apiClient.patch(`/returns/${id}/status`, { status, refund_amount: refundAmount }),
    onSuccess: () => {
      toast.success('وضعیت بروزرسانی شد');
      queryClient.invalidateQueries({ queryKey: ['returns'] });
    },
    onError: (error: any) => toast.error(error.response?.data?.message || 'خطا'),
  });

  const handleUpdateStatus = (id: string, status: string, refundAmount?: number) => {
    if (updateStatusMutation.isPending) return;
    updateStatusMutation.mutate({ id, status, refundAmount });
  };

  const handleRefund = (id: string) => {
    const amount = parseInt(refundAmounts[id] || '');
    if (!amount || amount <= 0) {
      toast.error('مبلغ معتبر وارد کنید');
      return;
    }
    handleUpdateStatus(id, 'refunded', amount);
  };

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <SvgSpinnersRingResize className="animate-spin text-primary" width={48} />
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
              <Select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                placeholder="همه وضعیت‌ها"
                options={statusOptions}
              />
            </div>
          </div>

          {/* Table */}
          <Table className="text-sm">
            <THead>
              <TH align="right">شماره</TH>
              <TH align="right" hideBelow="md">سفارش</TH>
              <TH align="right" hideBelow="lg">علت</TH>
              <TH align="center">مبلغ</TH>
              <TH align="center">وضعیت</TH>
              <TH align="center">عملیات</TH>
            </THead>
            <TBody>
              {isLoading ? (
                <TableSkeleton rows={5} columns={6} />
              ) : data?.data?.length === 0 ? (
                <TableEmpty colSpan={6} message="مرجوعی یافت نشد" icon={MdiKeyboardReturn} />
              ) : (
                data?.data?.map((ret: any) => {
                  const status = returnStatusBadge(ret.status);
                  return (
                    <TRow key={ret.id} hover>
                      <TD align="right" label="شماره">
                        <div>
                          <span className="font-medium text-primary">{ret.return_number}</span>
                          <p className="text-xs text-text-muted">
                            {new Date(ret.created_at).toLocaleDateString('fa-IR')}
                          </p>
                        </div>
                      </TD>
                      <TD align="right" label="سفارش" hideBelow="md" className="text-text-secondary">
                        {ret.order?.order_number || '-'}
                      </TD>
                      <TD align="right" label="علت" hideBelow="lg">
                        <p className="text-text-secondary text-xs line-clamp-2">{ret.reason}</p>
                      </TD>
                      <TD align="center" label="مبلغ" className="font-medium">
                        {ret.refund_amount > 0 ? formatPrice(ret.refund_amount) : '-'}
                      </TD>
                      <TD align="center" label="وضعیت">
                        <Badge variant={status.variant} size="sm">{status.label}</Badge>
                      </TD>
                      <TD align="center" label="عملیات">
                        <div className="flex flex-col justify-center gap-1 items-center">
                          {ret.status === 'pending' && (
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleUpdateStatus(ret.id, 'approved')}
                                disabled={updateStatusMutation.isPending}
                                className="px-3 py-1 bg-success-light text-success rounded text-xs hover:bg-success/20 disabled:opacity-50"
                              >
                                تایید
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(ret.id, 'rejected')}
                                disabled={updateStatusMutation.isPending}
                                className="px-3 py-1 bg-error-light text-error rounded text-xs hover:bg-error/20 disabled:opacity-50"
                              >
                                رد
                              </button>
                            </div>
                          )}
                          {ret.status === 'approved' && (
                            <button
                              onClick={() => handleUpdateStatus(ret.id, 'received')}
                              disabled={updateStatusMutation.isPending}
                              className="px-3 py-1 bg-primary-light text-primary rounded text-xs hover:bg-primary/20 disabled:opacity-50"
                            >
                              دریافت شد
                            </button>
                          )}
                          {ret.status === 'received' && (
                            <div className="flex items-center gap-1">
                              <Input
                                type="number"
                                placeholder="مبلغ (تومان)"
                                wrapperClassName="w-28"
                                className="text-xs py-1"
                                value={refundAmounts[ret.id] ?? ''}
                                onChange={(e) =>
                                  setRefundAmounts((prev) => ({ ...prev, [ret.id]: e.target.value }))
                                }
                              />
                              <button
                                onClick={() => handleRefund(ret.id)}
                                disabled={updateStatusMutation.isPending}
                                className="px-3 py-1 bg-info-light text-info rounded text-xs hover:bg-info/20 disabled:opacity-50"
                              >
                                بازگشت وجه
                              </button>
                            </div>
                          )}
                          <button
                            onClick={() => router.push(`/admin/returns/${ret.id}`)}
                            className="px-3 py-1 bg-surface-raised rounded text-xs"
                          >
                            جزئیات
                          </button>
                        </div>
                      </TD>
                    </TRow>
                  );
                })
              )}
            </TBody>
          </Table>

          {/* Pagination */}
          {data?.meta && (
            <Pagination meta={data.meta} onPageChange={setPage} itemLabel="مرجوعی" className="mt-6" />
          )}
        </div>
      </main>
    </div>
  );
}
