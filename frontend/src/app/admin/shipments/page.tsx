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
import AdminPage from '@/components/layout/AdminPage';
import {
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
import {
  LucideSearch,
  MdiTruckDelivery,
  MdiOpenInNew,
} from '@/components/icons/Icons';

const STATUSES: ShipmentStatus[] = [
  'pending', 'processing', 'shipped', 'in_transit',
  'out_for_delivery', 'delivered', 'failed', 'returned',
];

const statusFilterOptions = STATUSES.map((s) => ({
  value: s,
  label: shipmentStatusLabels[s],
}));

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

  return (
    <AdminPage
      maxWidth="6xl"
      loading={isAuthLoading}
      header={<PageHeader title="مرسولات" icon={MdiTruckDelivery} />}
      filters={
        <PageFilters>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              wrapperClassName="sm:col-span-2"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="جستجو بر اساس کد رهگیری یا شماره سفارش"
              icon={LucideSearch}
            />
            <Select
              value={statusFilter === 'all' ? '' : statusFilter}
              onChange={(e) => {
                setStatusFilter((e.target.value || 'all') as StatusFilter);
                setPage(1);
              }}
              placeholder="همه وضعیت‌ها"
              options={statusFilterOptions}
            />
          </div>
        </PageFilters>
      }
      footer={
        data?.meta && (
          <Pagination
            meta={data.meta}
            onPageChange={setPage}
            itemLabel="مرسوله"
          />
        )
      }
    >
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
                    <TD align="right" cardSlot="header">
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
    </AdminPage>
  );
}
