// src/app/admin/shipments/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAdminRoute } from '@/modules/auth/hooks/useAdminRoute';
import { useAdminShipments, useAdminUpdateShipment } from '@/modules/shipments/hooks/useShipments';
import {
  shipmentStatusLabels,
  shipmentStatusColors,
  type AdminShipment,
  type ShipmentStatus,
} from '@/modules/shipments/types/shipment.types';
import AdminSidebar from '@/components/layout/AdminSidebar';
import {
  Input,
  Pagination,
  Table,
  TBody,
  TD,
  TableEmpty,
  TableSkeleton,
  TH,
  THead,
  TRow,
} from '@/components/ui';
import {
  LucideSearch,
  MdiTruckDelivery,
  MdiOpenInNew,
  SvgSpinnersRingResize,
} from '@/components/icons/Icons';

const STATUSES: ShipmentStatus[] = [
  'pending', 'processing', 'shipped', 'in_transit',
  'out_for_delivery', 'delivered', 'failed', 'returned',
];

type StatusFilter = 'all' | ShipmentStatus;

export default function AdminShipmentsPage() {
  const { isLoading: isAuthLoading } = useAdminRoute();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data, isLoading } = useAdminShipments({
    page,
    limit: 20,
    ...(search && { search }),
    ...(statusFilter !== 'all' && { status: statusFilter }),
  });

  const updateShipment = useAdminUpdateShipment();

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <SvgSpinnersRingResize className="text-primary" width={48} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 lg:mr-64 p-4 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <MdiTruckDelivery className="w-7 h-7 text-primary" />
            <h1 className="text-2xl font-bold text-text-primary">مرسولات</h1>
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-3 mb-6">
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="جستجو بر اساس کد رهگیری یا شماره سفارش"
              icon={LucideSearch}
            />
            <div className="flex gap-2 flex-wrap">
              {(['all', ...STATUSES] as StatusFilter[]).map((s) => (
                <button
                  key={s}
                  onClick={() => { setStatusFilter(s); setPage(1); }}
                  className={`px-3 py-1.5 rounded-button text-xs font-medium transition-colors whitespace-nowrap ${
                    statusFilter === s
                      ? 'bg-primary text-white'
                      : 'bg-surface border border-border text-text-secondary hover:bg-surface-raised'
                  }`}
                >
                  {s === 'all' ? 'همه' : shipmentStatusLabels[s]}
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          <Table className="text-sm">
            <THead>
              <TH align="right">سفارش</TH>
              <TH align="right">مشتری</TH>
              <TH align="right">پیک / کد رهگیری</TH>
              <TH align="right">وضعیت</TH>
            </THead>
            <TBody>
              {isLoading ? (
                <TableSkeleton rows={6} columns={4} />
              ) : data?.data?.length === 0 ? (
                <TableEmpty colSpan={4} message="مرسوله‌ای یافت نشد" icon={MdiTruckDelivery} />
              ) : (
                data?.data?.map((shipment: AdminShipment) => (
                  <TRow key={shipment.id} hover>
                    <TD align="right" label="سفارش">
                      <div>
                        <Link
                          href={`/admin/orders/${shipment.order_id}`}
                          className="text-primary hover:underline font-medium inline-flex items-center gap-1"
                        >
                          {shipment.order_number || '—'}
                          <MdiOpenInNew className="w-3.5 h-3.5" />
                        </Link>
                        <p className="text-xs text-text-muted mt-0.5">
                          {new Date(shipment.created_at).toLocaleDateString('fa-IR')}
                        </p>
                      </div>
                    </TD>
                    <TD align="right" label="مشتری" className="text-text-secondary">
                      {shipment.customer_name || '—'}
                    </TD>
                    <TD align="right" label="پیک / کد رهگیری">
                      <div>
                        <p className="text-text-primary">{shipment.courier_name}</p>
                        {shipment.tracking_url ? (
                          <a
                            href={shipment.tracking_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline"
                          >
                            {shipment.tracking_number}
                          </a>
                        ) : (
                          <span className="text-xs text-text-muted">{shipment.tracking_number}</span>
                        )}
                      </div>
                    </TD>
                    <TD align="right" label="وضعیت">
                      <select
                        value={shipment.status}
                        onChange={(e) =>
                          updateShipment.mutate({ id: shipment.id, data: { status: e.target.value as ShipmentStatus } })
                        }
                        disabled={updateShipment.isPending}
                        className={`text-xs font-medium px-2 py-1 rounded-full border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary ${shipmentStatusColors[shipment.status]}`}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>{shipmentStatusLabels[s]}</option>
                        ))}
                      </select>
                    </TD>
                  </TRow>
                ))
              )}
            </TBody>
          </Table>

          {/* Pagination */}
          {data?.meta && (
            <Pagination meta={data.meta} onPageChange={setPage} itemLabel="مرسوله" className="mt-6" />
          )}
        </div>
      </main>
    </div>
  );
}
