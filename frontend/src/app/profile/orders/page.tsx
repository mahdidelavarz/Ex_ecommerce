// src/app/(profile)/profile/orders/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMyOrders } from '@/modules/orders/hooks/useOrders';
import { formatPrice } from '@/utils/formatPrice';
import { useProtectedRoute } from '@/modules/auth/hooks/useProtectedRoute';
import { Badge, Card, EmptyState, Pagination } from '@/components/ui';
import { orderStatusBadge } from '@/utils/statusBadge';
import { MdiClipboardTextOff, SvgSpinnersRingResize } from '@/components/icons/Icons';

export default function ProfileOrdersPage() {
  const { user, isLoading: isAuthLoading } = useProtectedRoute();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useMyOrders({ page, limit: 10 });

  if (isAuthLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <SvgSpinnersRingResize className="animate-spin text-primary" width={48} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Profile Nav */}
      <div className="flex items-center gap-6 mb-8 border-b border-border pb-4">
        <Link href="/profile" className="text-text-secondary hover:text-primary transition-colors">پروفایل</Link>
        <Link href="/profile/orders" className="text-primary font-medium border-b-2 border-primary pb-4 -mb-[17px]">سفارش‌ها</Link>
        <Link href="/profile/addresses" className="text-text-secondary hover:text-primary transition-colors">آدرس‌ها</Link>
        <Link href="/profile/sessions" className="text-text-secondary hover:text-primary transition-colors">نشست‌ها</Link>
      </div>

      <h1 className="text-2xl font-bold text-text-primary mb-8">سفارش‌های من</h1>

      {data?.data?.length === 0 ? (
        <Card className="py-4">
          <EmptyState icon={MdiClipboardTextOff} title="هیچ سفارشی ثبت نشده">
            <Link href="/products" className="text-primary hover:underline">مشاهده محصولات</Link>
          </EmptyState>
        </Card>
      ) : (
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
                <div className="flex items-center gap-4">
                  <Badge variant={orderStatusBadge(order.order_status).variant} size="sm">
                    {orderStatusBadge(order.order_status).label}
                  </Badge>
                  <span className="font-bold">{formatPrice(order.total_amount)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {data?.meta && (
        <Pagination meta={data.meta} onPageChange={setPage} itemLabel="سفارش" className="mt-6" />
      )}
    </div>
  );
}