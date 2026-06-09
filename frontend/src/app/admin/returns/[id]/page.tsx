// src/app/(admin)/admin/returns/[id]/page.tsx
'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useAdminRoute } from '@/modules/auth/hooks/useAdminRoute';
import AdminSidebar from '@/components/layout/AdminSidebar';
import Button from '@/components/ui/Button';
import { formatPrice } from '@/utils/formatPrice';
import type { ApiResponse } from '@/modules/auth/types/auth.type';
import { MdiArrowRight, MdiClipboardTextOff, SvgSpinnersRingResize } from '@/components/icons/Icons';

const statusLabels: Record<string, string> = {
  pending: 'در انتظار', approved: 'تایید شده', rejected: 'رد شده',
  received: 'دریافت شده', refunded: 'مسترد شده',
};

const statusColors: Record<string, string> = {
  pending: 'bg-warning-light text-warning', approved: 'bg-info-light text-info',
  rejected: 'bg-error-light text-error', received: 'bg-primary-light text-primary',
  refunded: 'bg-success-light text-success',
};

export default function AdminReturnDetailPage() {
  const router = useRouter();
  const params = useParams();
  const returnId = params.id as string;
  const queryClient = useQueryClient();
  const { isLoading: isAuthLoading } = useAdminRoute();

  const { data: ret, isLoading } = useQuery({
    queryKey: ['returns', returnId],
    queryFn: async () => {
      const r = await apiClient.get<ApiResponse<any>>(`/returns/${returnId}`);
      return r.data.data;
    },
    enabled: !!returnId,
  });

  const [adminNote, setAdminNote] = useState('');
  const [refundAmount, setRefundAmount] = useState<number>(0);

  const updateStatus = async (status: string) => {
    try {
      const body: any = { status };
      if (status === 'refunded' && refundAmount > 0) body.refund_amount = refundAmount;
      if (adminNote) body.admin_note = adminNote;

      await apiClient.patch(`/returns/${returnId}/status`, body);
      toast.success('وضعیت بروزرسانی شد');
      queryClient.invalidateQueries({ queryKey: ['returns'] });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'خطا');
    }
  };

  if (isAuthLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <SvgSpinnersRingResize className="animate-spin text-primary" width={48} />
      </div>
    );
  }

  if (!ret) {
    return (
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="flex-1 lg:mr-64 p-8 text-center">
          <MdiClipboardTextOff className="text-text-muted mx-auto mb-4" width={64} />
          <h1 className="text-xl font-bold">مرجوعی یافت نشد</h1>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 lg:mr-64 p-4 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button onClick={() => router.push('/admin/returns')} className="p-2 hover:bg-surface-raised rounded-button">
                <MdiArrowRight className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-text-primary">{ret.return_number}</h1>
                <p className="text-text-secondary text-sm">سفارش: {ret.order?.order_number}</p>
              </div>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${statusColors[ret.status]}`}>
              {statusLabels[ret.status]}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Info */}
            <div className="bg-surface rounded-card shadow-card p-6">
              <h2 className="font-bold text-text-primary mb-4">اطلاعات مرجوعی</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-text-muted">علت:</span>
                  <p className="text-text-primary mt-1">{ret.reason}</p>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">مبلغ بازگشتی:</span>
                  <span className="font-bold">{ret.refund_amount > 0 ? formatPrice(ret.refund_amount) : '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">تاریخ ثبت:</span>
                  <span>{new Date(ret.created_at).toLocaleDateString('fa-IR')}</span>
                </div>
                {ret.admin_note && (
                  <div className="bg-info-light text-info p-3 rounded text-xs">{ret.admin_note}</div>
                )}
              </div>
            </div>

            {/* Customer */}
            <div className="bg-surface rounded-card shadow-card p-6">
              <h2 className="font-bold text-text-primary mb-4">اطلاعات مشتری</h2>
              <p className="font-medium">{ret.user?.full_name || '-'}</p>
              <p className="text-text-secondary text-sm">{ret.user?.phone_number}</p>
              <p className="text-text-secondary text-sm">{ret.user?.email}</p>
            </div>

            {/* Items */}
            <div className="lg:col-span-2 bg-surface rounded-card shadow-card p-6">
              <h2 className="font-bold text-text-primary mb-4">اقلام مرجوعی</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-text-muted">
                    <th className="text-right py-2">محصول</th>
                    <th className="text-center py-2">تعداد</th>
                    <th className="text-right py-2">علت</th>
                  </tr>
                </thead>
                <tbody>
                  {ret.items?.map((item: any) => (
                    <tr key={item.id} className="border-b border-border">
                      <td className="py-3 font-medium">{item.order_item?.product_title || '-'}</td>
                      <td className="text-center">{item.quantity}</td>
                      <td className="text-text-secondary text-xs">{item.reason || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Admin Actions */}
            <div className="lg:col-span-2 bg-surface rounded-card shadow-card p-6">
              <h2 className="font-bold text-text-primary mb-4">عملیات ادمین</h2>
              
              <div className="space-y-4">
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="یادداشت ادمین..."
                  rows={3}
                  className="w-full px-4 py-2 bg-surface border border-border rounded-input text-sm resize-none"
                />

                {ret.status === 'pending' && (
                  <div className="flex gap-3">
                    <Button onClick={() => updateStatus('approved')} className="bg-success hover:bg-success/90">تایید</Button>
                    <Button onClick={() => updateStatus('rejected')} variant="outline" className="text-error border-error">رد</Button>
                  </div>
                )}

                {ret.status === 'approved' && (
                  <div className="flex items-center gap-3">
                    <Button onClick={() => updateStatus('received')}>دریافت شد</Button>
                    <input
                      type="number"
                      value={refundAmount || ''}
                      onChange={(e) => setRefundAmount(parseInt(e.target.value) || 0)}
                      placeholder="مبلغ بازگشتی (تومان)"
                      className="px-4 py-2 bg-surface border border-border rounded-input text-sm w-48"
                    />
                    <Button onClick={() => updateStatus('refunded')} className="bg-info">بازگشت وجه</Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}