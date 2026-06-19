// src/app/returns/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useMyOrders, useOrder } from '@/modules/orders/hooks/useOrders';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';
import type { ApiResponse } from '@/modules/auth/types/auth.type';

const statusConfig: Record<string, { label: string; className: string }> = {
  pending:  { label: 'در انتظار بررسی', className: 'bg-warning-light text-warning' },
  approved: { label: 'تایید شده',       className: 'bg-success-light text-success' },
  rejected: { label: 'رد شده',          className: 'bg-error-light text-error' },
  received: { label: 'دریافت شد',       className: 'bg-blue-100 text-blue-700' },
  refunded: { label: 'وجه بازگشت یافت', className: 'bg-success-light text-success' },
};

export default function ReturnsPage() {
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState<string>('');
  const [reason, setReason] = useState('');
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({});

  const { data: orders } = useMyOrders({ limit: 50 });
  const { data: orderDetail } = useOrder(selectedOrder);

  const { data: returns } = useQuery({
    queryKey: ['returns'],
    queryFn: async () => {
      const r = await apiClient.get<ApiResponse<any[]>>('/returns');
      return r.data.data;
    },
  });

  const createReturn = useMutation({
    mutationFn: (data: any) => apiClient.post('/returns', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['returns'] });
      toast.success('درخواست مرجوعی ثبت شد');
      setSelectedOrder('');
      setReason('');
      setSelectedItems({});
    },
    onError: (error: any) => toast.error(error.response?.data?.message || 'خطا'),
  });

  const handleOrderChange = (orderId: string) => {
    setSelectedOrder(orderId);
    setSelectedItems({});
  };

  const handleSubmit = () => {
    if (!selectedOrder || !reason) return;
    const items = Object.entries(selectedItems)
      .filter(([_, qty]) => qty > 0)
      .map(([id, qty]) => ({ order_item_id: id, quantity: qty }));

    if (items.length === 0) {
      toast.error('حداقل یک کالا انتخاب کنید');
      return;
    }

    createReturn.mutate({ order_id: selectedOrder, reason, items });
  };

  return (
    <main className="min-h-screen bg-background" dir="rtl">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-2xl font-bold text-text-primary mb-8">درخواست مرجوعی</h1>

        {/* Return Form */}
        <div className="bg-surface rounded-card shadow-card p-6 mb-8">
          <h2 className="font-bold text-text-primary mb-4">ثبت درخواست جدید</h2>

          <div className="space-y-4">
            <select
              value={selectedOrder}
              onChange={(e) => handleOrderChange(e.target.value)}
              className="w-full px-4 py-2 bg-surface border border-border rounded-input text-sm"
            >
              <option value="">انتخاب سفارش</option>
              {orders?.data
                ?.filter((o: any) => o.order_status === 'delivered')
                .map((order: any) => (
                  <option key={order.id} value={order.id}>
                    {order.order_number} - {new Date(order.created_at).toLocaleDateString('fa-IR')}
                  </option>
                ))}
            </select>

            {selectedOrder && orderDetail?.items && (
              <div className="border border-border rounded-card p-4">
                <p className="text-sm font-medium text-text-primary mb-3">اقلام سفارش — تعداد مرجوعی را وارد کنید:</p>
                <div className="space-y-3">
                  {orderDetail.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div className="text-sm text-text-primary">
                        <span>{item.product_title}</span>
                        {item.variant_title && (
                          <span className="text-text-muted"> — {item.variant_title}</span>
                        )}
                        <span className="text-text-muted text-xs mr-2">(موجود: {item.quantity})</span>
                      </div>
                      <input
                        type="number"
                        min={0}
                        max={item.quantity}
                        className="w-16 border border-border rounded px-2 py-1 text-sm text-center"
                        value={selectedItems[item.id] ?? 0}
                        onChange={(e) =>
                          setSelectedItems((prev) => ({
                            ...prev,
                            [item.id]: Math.min(parseInt(e.target.value) || 0, item.quantity),
                          }))
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="علت مرجوعی (حداقل ۱۰ کاراکتر)..."
              rows={3}
              className="w-full px-4 py-2 bg-surface border border-border rounded-input text-sm resize-none"
            />

            <Button onClick={handleSubmit} loading={createReturn.isPending}>ثبت درخواست</Button>
          </div>
        </div>

        {/* Returns History */}
        <h2 className="text-xl font-bold text-text-primary mb-4">درخواست‌های قبلی</h2>
        {!returns || returns.length === 0 ? (
          <div className="text-center py-8 bg-surface rounded-card">
            <p className="text-text-secondary">درخواست مرجوعی ثبت نشده</p>
          </div>
        ) : (
          <div className="space-y-3">
            {returns.map((ret: any) => {
              const status = statusConfig[ret.status] ?? { label: ret.status, className: 'bg-warning-light text-warning' };
              return (
                <Link
                  key={ret.id}
                  href={`/returns/${ret.id}`}
                  className="block bg-surface rounded-card shadow-card p-4 hover:bg-surface-raised transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-text-primary">{ret.return_number}</p>
                      <p className="text-sm text-text-muted mt-1 line-clamp-1">{ret.reason}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 ${status.className}`}>
                      {status.label}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
