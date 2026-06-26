// src/app/orders/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMyOrders } from '@/modules/orders/hooks/useOrders';
import { formatPrice } from '@/utils/formatPrice';
import { Badge, Button, EmptyState, Pagination, Select, Skeleton } from '@/components/ui';
import { orderStatusBadge } from '@/utils/statusBadge';
import { MdiClipboardTextOff } from '@/components/icons/Icons';

const statusOptions = [
  { value: 'pending', label: 'در انتظار' },
  { value: 'confirmed', label: 'تایید شده' },
  { value: 'processing', label: 'در حال پردازش' },
  { value: 'shipped', label: 'ارسال شده' },
  { value: 'delivered', label: 'تحویل شده' },
  { value: 'cancelled', label: 'لغو شده' },
  { value: 'returned', label: 'مرجوع شده' },
];

export default function MyOrdersPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const { data, isLoading } = useMyOrders({ page, limit: 10, status: statusFilter || undefined });

  const handleStatusChange = (v: string) => {
    setStatusFilter(v);
    setPage(1);
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-text-primary">سفارش‌های من</h1>
          <Select
            value={statusFilter}
            onChange={(e) => handleStatusChange(e.target.value)}
            placeholder="همه وضعیت‌ها"
            options={statusOptions}
            wrapperClassName="w-44"
          />
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-surface rounded-card shadow-card p-6 space-y-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            ))}
          </div>
        ) : data?.data?.length === 0 ? (
          <EmptyState icon={MdiClipboardTextOff} title="هیچ سفارشی یافت نشد">
            <Link href="/products">
              <Button variant="outline">مشاهده محصولات</Button>
            </Link>
          </EmptyState>
        ) : (
          <>
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
                    <div className="text-left flex items-center gap-4">
                      <Badge variant={orderStatusBadge(order.order_status).variant} size="sm">
                        {orderStatusBadge(order.order_status).label}
                      </Badge>
                      <span className="font-bold text-text-primary">{formatPrice(order.total_amount)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {data?.meta && (
              <Pagination meta={data.meta} onPageChange={setPage} itemLabel="سفارش" className="mt-8" />
            )}
          </>
        )}
      </div>
    </main>
  );
}
