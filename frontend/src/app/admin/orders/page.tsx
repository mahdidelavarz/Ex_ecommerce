// src/app/(admin)/admin/orders/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { orderService } from '@/modules/orders/services/order.service';
import { useAdminRoute } from '@/modules/auth/hooks/useAdminRoute';
import AdminPage from '@/components/layout/AdminPage';
import { formatPrice } from '@/utils/formatPrice';
import {
  Badge,
  Input,
  PageFilters,
  PageHeader,
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
import { orderStatusBadge, paymentStatusBadge } from '@/utils/statusBadge';
import { LucideSearch, MdiPackageVariantClosed } from '@/components/icons/Icons';

const statusOptions = [
  { value: 'pending', label: 'در انتظار' },
  { value: 'confirmed', label: 'تایید شده' },
  { value: 'processing', label: 'در حال پردازش' },
  { value: 'shipped', label: 'ارسال شده' },
  { value: 'delivered', label: 'تحویل شده' },
  { value: 'cancelled', label: 'لغو شده' },
  { value: 'returned', label: 'مرجوع شده' },
];

const paymentOptions = [
  { value: 'pending', label: 'در انتظار' },
  { value: 'paid', label: 'پرداخت شده' },
  { value: 'failed', label: 'ناموفق' },
];

export default function AdminOrdersPage() {
  const router = useRouter();
  const { isLoading: isAuthLoading } = useAdminRoute();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['orders', 'admin', { page, search, status: statusFilter, payment_status: paymentFilter }],
    queryFn: () => orderService.adminList({
      page, limit: 20,
      search: search || undefined,
      status: statusFilter || undefined,
      payment_status: paymentFilter || undefined,
    }),
  });

  return (
    <AdminPage
      maxWidth="7xl"
      loading={isAuthLoading}
      header={<PageHeader title="سفارشات" />}
      filters={
        <PageFilters>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="جستجو..."
              icon={LucideSearch}
            />
            <Select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              placeholder="همه وضعیت‌ها"
              options={statusOptions}
            />
            <Select
              value={paymentFilter}
              onChange={(e) => { setPaymentFilter(e.target.value); setPage(1); }}
              placeholder="همه پرداخت‌ها"
              options={paymentOptions}
            />
          </div>
        </PageFilters>
      }
      footer={
        data?.meta && (
          <Pagination
            meta={data.meta}
            onPageChange={setPage}
            itemLabel="سفارش"
          />
        )
      }
    >
      {/* Table */}
      <Table>
            <THead>
              <TH align="right">شماره سفارش</TH>
              <TH align="right" hideBelow="md">مشتری</TH>
              <TH align="center">مبلغ</TH>
              <TH align="center" hideBelow="sm">وضعیت</TH>
              <TH align="center" hideBelow="sm">پرداخت</TH>
              <TH align="center" hideBelow="lg">تاریخ</TH>
            </THead>
            <TBody>
              {isLoading ? (
                <TableSkeleton rows={5} columns={6} />
              ) : data?.data?.length === 0 ? (
                <TableEmpty colSpan={6} message="سفارشی یافت نشد" icon={MdiPackageVariantClosed} />
              ) : (
                data?.data?.map((order: any) => {
                  const status = orderStatusBadge(order.order_status);
                  const payment = paymentStatusBadge(order.payment_status);
                  return (
                    <TRow key={order.id} hover onClick={() => router.push(`/admin/orders/${order.id}`)}>
                      <TD align="right" cardSlot="header" className="text-primary">
                        {order.order_number}
                      </TD>
                      <TD align="right" label="مشتری" hideBelow="md" className="text-text-secondary">
                        {order.user?.full_name || order.customer_phone || '-'}
                      </TD>
                      <TD align="center" label="مبلغ" className="font-bold">
                        {formatPrice(order.total_amount)}
                      </TD>
                      <TD align="center" cardSlot="badge">
                        <Badge variant={status.variant} size="sm">{status.label}</Badge>
                      </TD>
                      <TD align="center" label="پرداخت" hideBelow="sm">
                        <Badge variant={payment.variant} size="sm">{payment.label}</Badge>
                      </TD>
                      <TD align="center" label="تاریخ" hideBelow="lg" className="text-text-muted">
                        {new Date(order.created_at).toLocaleDateString('fa-IR')}
                      </TD>
                    </TRow>
                  );
                })
              )}
            </TBody>
          </Table>
    </AdminPage>
  );
}
