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
  LucideSearch,
  MdiTruckDelivery,
  MdiChevronLeft,
  MdiChevronRight,
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
            <div className="relative">
              <LucideSearch className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="جستجو بر اساس کد رهگیری یا شماره سفارش"
                className="w-full pr-10 pl-4 py-2 bg-surface border border-border rounded-input text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
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
          <div className="bg-surface rounded-card shadow-card overflow-hidden">
            {isLoading ? (
              <div className="p-6 space-y-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-14 bg-surface-raised rounded animate-pulse-soft" />
                ))}
              </div>
            ) : data?.data?.length === 0 ? (
              <div className="text-center py-12">
                <MdiTruckDelivery className="text-text-muted mx-auto mb-3" width={40} />
                <p className="text-text-secondary text-sm">مرسوله‌ای یافت نشد</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-text-muted text-xs border-b border-border bg-surface-raised/50">
                      <th className="text-right font-medium p-4">سفارش</th>
                      <th className="text-right font-medium p-4">مشتری</th>
                      <th className="text-right font-medium p-4">پیک / کد رهگیری</th>
                      <th className="text-right font-medium p-4">وضعیت</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {data?.data?.map((shipment: AdminShipment) => (
                      <tr key={shipment.id} className="hover:bg-surface-raised/50 transition-colors">
                        <td className="p-4">
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
                        </td>
                        <td className="p-4 text-text-secondary">{shipment.customer_name || '—'}</td>
                        <td className="p-4">
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
                        </td>
                        <td className="p-4">
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
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination */}
          {data?.meta && data.meta.totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 hover:bg-surface rounded-button disabled:opacity-50"
              >
                <MdiChevronRight className="w-5 h-5" />
              </button>
              <span className="px-4 py-2 text-sm text-text-secondary">
                {page} از {data.meta.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(data.meta.totalPages, p + 1))}
                disabled={page === data.meta.totalPages}
                className="p-2 hover:bg-surface rounded-button disabled:opacity-50"
              >
                <MdiChevronLeft className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
