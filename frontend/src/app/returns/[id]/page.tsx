// src/app/returns/[id]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { formatPrice } from '@/utils/formatPrice';
import type { ApiResponse } from '@/modules/auth/types/auth.type';
import { MdiArrowRight, SvgSpinnersRingResize } from '@/components/icons/Icons';

const statusConfig: Record<string, { label: string; className: string }> = {
  pending:  { label: 'در انتظار بررسی', className: 'bg-warning-light text-warning' },
  approved: { label: 'تایید شده',       className: 'bg-success-light text-success' },
  rejected: { label: 'رد شده',          className: 'bg-error-light text-error' },
  received: { label: 'دریافت شد',       className: 'bg-blue-100 text-blue-700' },
  refunded: { label: 'وجه بازگشت یافت', className: 'bg-success-light text-success' },
};

export default function ReturnDetailPage() {
  const params = useParams();
  const returnId = params.id as string;

  const { data: ret, isLoading } = useQuery({
    queryKey: ['returns', returnId],
    queryFn: async () => {
      const r = await apiClient.get<ApiResponse<any>>(`/returns/my/${returnId}`);
      return r.data.data;
    },
    enabled: !!returnId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <SvgSpinnersRingResize className="animate-spin text-primary" width={48} />
      </div>
    );
  }

  if (!ret) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-text-secondary">مرجوعی یافت نشد</p>
        <Link href="/returns" className="text-primary hover:underline">بازگشت به لیست</Link>
      </div>
    );
  }

  const status = statusConfig[ret.status] ?? { label: ret.status, className: 'bg-warning-light text-warning' };

  return (
    <main className="min-h-screen bg-background" dir="rtl">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/returns" className="p-2 hover:bg-surface-raised rounded-button">
            <MdiArrowRight className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-text-primary">{ret.return_number}</h1>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.className}`}>
            {status.label}
          </span>
        </div>

        <div className="space-y-6">
          <div className="bg-surface rounded-card shadow-card p-6">
            <h2 className="font-bold text-text-primary mb-4">جزئیات مرجوعی</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-text-muted">سفارش:</span>
                <span>{ret.order?.order_number || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">تاریخ ثبت:</span>
                <span>{new Date(ret.created_at).toLocaleDateString('fa-IR')}</span>
              </div>
              <div>
                <span className="text-text-muted">علت:</span>
                <p className="text-text-primary mt-1">{ret.reason}</p>
              </div>
              {ret.refund_amount > 0 && (
                <div className="flex justify-between font-bold">
                  <span className="text-text-muted">مبلغ بازگشتی:</span>
                  <span className="text-success">{formatPrice(ret.refund_amount)}</span>
                </div>
              )}
              {ret.admin_note && (
                <div className="bg-info-light text-info p-3 rounded text-xs mt-2">
                  <span className="font-medium">یادداشت ادمین: </span>{ret.admin_note}
                </div>
              )}
            </div>
          </div>

          <div className="bg-surface rounded-card shadow-card p-6">
            <h2 className="font-bold text-text-primary mb-4">اقلام مرجوعی</h2>
            {ret.items?.length > 0 ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-text-muted">
                    <th className="text-right py-2">محصول</th>
                    <th className="text-center py-2">تعداد</th>
                  </tr>
                </thead>
                <tbody>
                  {ret.items.map((item: any) => (
                    <tr key={item.id} className="border-b border-border last:border-0">
                      <td className="py-3 font-medium">
                        {item.order_item?.product_title || '-'}
                        {item.order_item?.variant_title && (
                          <span className="text-text-muted font-normal"> — {item.order_item.variant_title}</span>
                        )}
                      </td>
                      <td className="text-center">{item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-text-secondary text-sm">اطلاعاتی موجود نیست</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
