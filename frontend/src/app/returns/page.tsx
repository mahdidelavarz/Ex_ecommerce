// src/app/returns/page.tsx
'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useMyOrders } from '@/modules/orders/hooks/useOrders';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';
import type { ApiResponse } from '@/modules/auth/types/auth.type';

export default function ReturnsPage() {
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState<string>('');
  const [reason, setReason] = useState('');
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({});

  const { data: orders } = useMyOrders({ limit: 50 });
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
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-2xl font-bold text-text-primary mb-8">درخواست مرجوعی</h1>

        {/* Return Form */}
        <div className="bg-surface rounded-card shadow-card p-6 mb-8">
          <h2 className="font-bold text-text-primary mb-4">ثبت درخواست جدید</h2>

          <div className="space-y-4">
            <select
              value={selectedOrder}
              onChange={(e) => setSelectedOrder(e.target.value)}
              className="w-full px-4 py-2 bg-surface border border-border rounded-input text-sm"
            >
              <option value="">انتخاب سفارش</option>
              {orders?.data?.filter((o: any) => ['delivered', 'shipped'].includes(o.order_status)).map((order: any) => (
                <option key={order.id} value={order.id}>{order.order_number} - {new Date(order.created_at).toLocaleDateString('fa-IR')}</option>
              ))}
            </select>

            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="علت مرجوعی..."
              rows={3}
              className="w-full px-4 py-2 bg-surface border border-border rounded-input text-sm resize-none"
            />

            <Button onClick={handleSubmit} loading={createReturn.isPending}>ثبت درخواست</Button>
          </div>
        </div>

        {/* Returns History */}
        <h2 className="text-xl font-bold text-text-primary mb-4">درخواست‌های قبلی</h2>
        {returns?.length === 0 ? (
          <div className="text-center py-8 bg-surface rounded-card">
            <p className="text-text-secondary">درخواست مرجوعی ثبت نشده</p>
          </div>
        ) : (
          <div className="space-y-3">
            {returns?.map((ret: any) => (
              <div key={ret.id} className="bg-surface rounded-card shadow-card p-4">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">{ret.return_number}</p>
                    <p className="text-sm text-text-muted">{ret.reason}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs ${
                    ret.status === 'approved' ? 'bg-success-light text-success' :
                    ret.status === 'rejected' ? 'bg-error-light text-error' :
                    'bg-warning-light text-warning'
                  }`}>{ret.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}