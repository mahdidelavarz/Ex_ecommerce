// src/app/(admin)/admin/returns/[id]/page.tsx
'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useAdminRoute } from '@/modules/auth/hooks/useAdminRoute';
import AdminSidebar from '@/components/layout/AdminSidebar';
import { Badge, Button, Card, Input, Table, TBody, TD, TH, THead, TRow, Textarea } from '@/components/ui';
import { formatPrice } from '@/utils/formatPrice';
import { returnStatusBadge } from '@/utils/statusBadge';
import type { ApiResponse } from '@/modules/auth/types/auth.type';
import { MdiArrowRight, MdiClipboardTextOff, SvgSpinnersRingResize } from '@/components/icons/Icons';

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
  const [refundAmount, setRefundAmount] = useState<number | "">("");

  const updateStatus = async (status: string) => {
    try {
      const body: any = { status };
      if (status === 'refunded' && typeof refundAmount === 'number' && refundAmount > 0) body.refund_amount = refundAmount;
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
            <Badge variant={returnStatusBadge(ret.status).variant}>
              {returnStatusBadge(ret.status).label}
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Info */}
            <Card className="p-6">
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
            </Card>

            {/* Customer */}
            <Card className="p-6">
              <h2 className="font-bold text-text-primary mb-4">اطلاعات مشتری</h2>
              <p className="font-medium">{ret.user?.full_name || '-'}</p>
              <p className="text-text-secondary text-sm">{ret.user?.phone_number}</p>
              <p className="text-text-secondary text-sm">{ret.user?.email}</p>
            </Card>

            {/* Items */}
            <Card className="lg:col-span-2 p-6">
              <h2 className="font-bold text-text-primary mb-4">اقلام مرجوعی</h2>
              <Table className="text-sm">
                <THead>
                  <TH align="right">محصول</TH>
                  <TH align="center">تعداد</TH>
                  <TH align="right">علت</TH>
                </THead>
                <TBody>
                  {ret.items?.map((item: any) => (
                    <TRow key={item.id}>
                      <TD align="right" label="محصول" className="font-medium">{item.order_item?.product_title || '-'}</TD>
                      <TD align="center" label="تعداد">{item.quantity}</TD>
                      <TD align="right" label="علت" className="text-text-secondary text-xs">{item.reason || '-'}</TD>
                    </TRow>
                  ))}
                </TBody>
              </Table>
            </Card>

            {/* Admin Actions */}
            <Card className="lg:col-span-2 p-6">
              <h2 className="font-bold text-text-primary mb-4">عملیات ادمین</h2>

              <div className="space-y-4">
                <Textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="یادداشت ادمین..."
                  rows={3}
                />

                {ret.status === 'pending' && (
                  <div className="flex gap-3">
                    <Button onClick={() => updateStatus('approved')} className="bg-success hover:bg-success/90">تایید</Button>
                    <Button onClick={() => updateStatus('rejected')} variant="outline" className="text-error border-error">رد</Button>
                  </div>
                )}

                {ret.status === 'approved' && (
                  <Button onClick={() => updateStatus('received')}>دریافت شد</Button>
                )}

                {ret.status === 'received' && (
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      wrapperClassName="w-48"
                      value={refundAmount}
                      onChange={(e) => setRefundAmount(e.target.value === '' ? '' : parseInt(e.target.value))}
                      placeholder="مبلغ بازگشتی (تومان)"
                    />
                    <Button onClick={() => updateStatus('refunded')} className="bg-info">بازگشت وجه</Button>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}