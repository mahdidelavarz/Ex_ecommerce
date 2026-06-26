// src/app/returns/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useMyOrders, useOrder } from '@/modules/orders/hooks/useOrders';
import { Badge, Button, Card, Input, Select, Textarea } from '@/components/ui';
import { returnStatusBadge } from '@/utils/statusBadge';
import toast from 'react-hot-toast';
import type { ApiResponse } from '@/modules/auth/types/auth.type';

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
        <Card className="p-6 mb-8">
          <h2 className="font-bold text-text-primary mb-4">ثبت درخواست جدید</h2>

          <div className="space-y-4">
            <Select
              value={selectedOrder}
              onChange={(e) => handleOrderChange(e.target.value)}
              placeholder="انتخاب سفارش"
            >
              {orders?.data
                ?.filter((o: any) => o.order_status === 'delivered')
                .map((order: any) => (
                  <option key={order.id} value={order.id}>
                    {order.order_number} - {new Date(order.created_at).toLocaleDateString('fa-IR')}
                  </option>
                ))}
            </Select>

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
                      <Input
                        type="number"
                        min={0}
                        max={item.quantity}
                        wrapperClassName="w-16"
                        className="text-sm text-center py-1"
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

            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="علت مرجوعی (حداقل ۱۰ کاراکتر)..."
              rows={3}
            />

            <Button onClick={handleSubmit} loading={createReturn.isPending}>ثبت درخواست</Button>
          </div>
        </Card>

        {/* Returns History */}
        <h2 className="text-xl font-bold text-text-primary mb-4">درخواست‌های قبلی</h2>
        {!returns || returns.length === 0 ? (
          <div className="text-center py-8 bg-surface rounded-card">
            <p className="text-text-secondary">درخواست مرجوعی ثبت نشده</p>
          </div>
        ) : (
          <div className="space-y-3">
            {returns.map((ret: any) => {
              const status = returnStatusBadge(ret.status);
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
                    <Badge variant={status.variant} size="sm" className="shrink-0">{status.label}</Badge>
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
