// src/app/admin/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAdminRoute } from '@/modules/auth/hooks/useAdminRoute';
import {
  useDashboardStats,
  useSalesSeries,
  useTopProducts,
  useLowStockVariants,
} from '@/modules/dashboard/hooks/useDashboard';
import type { DashboardPeriod } from '@/modules/dashboard/types/dashboard.types';
import KpiCard from '@/modules/dashboard/components/KpiCard';
import SalesChart from '@/modules/dashboard/components/SalesChart';
import OrderStatusChart from '@/modules/dashboard/components/OrderStatusChart';
import TopProductsCard from '@/modules/dashboard/components/TopProductsCard';
import AdminPage from '@/components/layout/AdminPage';
import { Badge, PageHeader, Skeleton, Table, TBody, TD, TableEmpty, TH, THead, TRow } from '@/components/ui';
import { formatPrice } from '@/utils/formatPrice';
import { toPersianDigits } from '@/utils/toPersianDigits';
import { orderStatusBadge } from '@/utils/statusBadge';
import {
  MdiCart,
  MdiPackageVariant,
  MdiAccountGroup,
  MdiTicketPercent,
  MdiAlertCircle,
  MdiStore,
  MdiChevronLeft,
  MdiViewDashboard,
  MdiCashMultiple,
  MdiTrendingUp,
  MdiSaleOutline,
  MdiCubeOutline,
  MdiWallet,
} from '@/components/icons/Icons';

const quickLinks = [
  { title: 'محصولات', href: '/admin/products', icon: MdiPackageVariant },
  { title: 'سفارشات', href: '/admin/orders', icon: MdiCart },
  { title: 'کاربران', href: '/admin/users', icon: MdiAccountGroup },
  { title: 'تخفیف‌ها', href: '/admin/coupons', icon: MdiTicketPercent },
];

const periods: { value: DashboardPeriod; label: string }[] = [
  { value: '7d', label: '۷ روز' },
  { value: '30d', label: '۳۰ روز' },
  { value: 'month', label: 'این ماه' },
  { value: 'all', label: 'همه' },
];

export default function AdminDashboardPage() {
  const { isLoading: isAuthLoading } = useAdminRoute();
  const [period, setPeriod] = useState<DashboardPeriod>('30d');

  const { data: stats, isLoading } = useDashboardStats(period);
  const { data: salesSeries, isLoading: isSalesLoading } = useSalesSeries(period);
  const { data: topProducts, isLoading: isTopLoading } = useTopProducts(period);
  const { data: lowStock, isLoading: isLowStockLoading } = useLowStockVariants();

  const toman = (v: number | undefined) => (v != null ? `${formatPrice(v)}` : '—');
  const count = (v: number | undefined) => (v != null ? toPersianDigits(v) : '—');

  // Money metrics scoped to the selected period (paid orders only).
  const financialKpis = [
    { label: 'فروش کل', value: toman(stats?.total_sell), icon: MdiSaleOutline, color: 'text-primary bg-primary-light' },
    { label: 'قیمت خرید کل', value: toman(stats?.total_cogs), icon: MdiCashMultiple, color: 'text-info bg-info-light' },
    { label: 'سود کل', value: toman(stats?.total_profit), icon: MdiTrendingUp, color: 'text-success bg-success-light', highlight: true },
    { label: 'تخفیف کل', value: toman(stats?.total_discount), icon: MdiTicketPercent, color: 'text-warning bg-warning-light' },
    { label: 'تعداد فروش', value: count(stats?.total_items_sold), icon: MdiCubeOutline, color: 'text-primary bg-primary-light', sublabel: 'تعداد کالای فروخته‌شده' },
    { label: 'میانگین سفارش', value: toman(stats?.avg_order_value), icon: MdiWallet, color: 'text-info bg-info-light' },
  ];

  // Lifetime / operational counters (period-independent).
  const operationalKpis = [
    { label: 'درآمد پرداخت‌شده (کل)', value: toman(stats?.total_revenue), icon: MdiStore, color: 'text-success bg-success-light' },
    { label: 'سفارشات', value: count(stats?.total_orders), icon: MdiCart, color: 'text-primary bg-primary-light' },
    { label: 'سفارشات در انتظار', value: count(stats?.pending_orders), icon: MdiAlertCircle, color: 'text-warning bg-warning-light' },
    { label: 'محصولات فعال', value: count(stats?.total_products), icon: MdiPackageVariant, color: 'text-info bg-info-light' },
    { label: 'مشتریان', value: count(stats?.total_customers), icon: MdiAccountGroup, color: 'text-primary bg-primary-light' },
    { label: 'موجودی کم', value: count(stats?.low_stock_count), icon: MdiAlertCircle, color: 'text-error bg-error-light' },
  ];

  return (
    <AdminPage
      maxWidth="7xl"
      loading={isAuthLoading}
      header={<PageHeader title="داشبورد" subtitle="نمای کلی فروشگاه" icon={MdiViewDashboard} />}
    >
      <div className="space-y-8">
        {/* Period selector */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="font-bold text-text-primary flex items-center gap-2">
            <MdiTrendingUp className="w-5 h-5 text-success" />
            عملکرد مالی
          </h2>
          <div className="inline-flex rounded-xl bg-surface-raised p-1 gap-1">
            {periods.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  period === p.value
                    ? 'bg-surface text-primary shadow-card'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Financial KPI band */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {financialKpis.map((kpi) => (
            <KpiCard
              key={kpi.label}
              label={kpi.label}
              value={kpi.value}
              icon={kpi.icon}
              color={kpi.color}
              sublabel={kpi.sublabel}
              highlight={kpi.highlight}
              loading={isLoading}
            />
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <SalesChart data={salesSeries} loading={isSalesLoading} />
          </div>
          <OrderStatusChart data={stats?.orders_by_status} loading={isLoading} />
        </div>

        {/* Operational KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {operationalKpis.map((kpi) => (
            <KpiCard
              key={kpi.label}
              label={kpi.label}
              value={kpi.value}
              icon={kpi.icon}
              color={kpi.color}
              loading={isLoading}
            />
          ))}
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="bg-surface rounded-card shadow-card p-5 flex flex-col items-center gap-2.5 hover:shadow-card-hover hover:border-primary border border-transparent transition-all group"
            >
              <span className="w-11 h-11 rounded-full bg-primary-light text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                <link.icon className="w-6 h-6" />
              </span>
              <span className="text-sm font-medium text-text-secondary group-hover:text-text-primary transition-colors">
                {link.title}
              </span>
            </Link>
          ))}
        </div>

        {/* Top products + recent orders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TopProductsCard data={topProducts} loading={isTopLoading} />

          <div className="bg-surface rounded-card shadow-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-text-primary">آخرین سفارشات</h2>
              <Link href="/admin/orders" className="text-sm text-primary hover:underline flex items-center gap-1">
                مشاهده همه
                <MdiChevronLeft className="w-4 h-4" />
              </Link>
            </div>

            {isLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <Table className="text-sm">
                <THead>
                  <TH align="right">شماره</TH>
                  <TH align="right">مشتری</TH>
                  <TH align="right">مبلغ</TH>
                  <TH align="right">وضعیت</TH>
                </THead>
                <TBody>
                  {stats?.recent_orders.length === 0 ? (
                    <TableEmpty colSpan={4} message="هنوز سفارشی ثبت نشده است" icon={MdiCart} />
                  ) : (
                    stats?.recent_orders.map((order) => {
                      const status = orderStatusBadge(order.order_status);
                      return (
                        <TRow key={order.id} hover>
                          <TD align="right" cardSlot="header">
                            <Link href={`/admin/orders/${order.id}`} className="text-primary hover:underline font-medium">
                              {order.order_number}
                            </Link>
                          </TD>
                          <TD align="right" label="مشتری" className="text-text-secondary">{order.customer_name}</TD>
                          <TD align="right" label="مبلغ">{formatPrice(order.total_amount)}</TD>
                          <TD align="right" cardSlot="badge">
                            <Badge variant={status.variant} size="sm">{status.label}</Badge>
                          </TD>
                        </TRow>
                      );
                    })
                  )}
                </TBody>
              </Table>
            )}
          </div>
        </div>

        {/* Low stock */}
        <div className="bg-surface rounded-card shadow-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-text-primary flex items-center gap-2">
              <MdiAlertCircle className="w-5 h-5 text-error" />
              موجودی کم
            </h2>
            <Link href="/admin/products" className="text-sm text-primary hover:underline flex items-center gap-1">
              همه محصولات
              <MdiChevronLeft className="w-4 h-4" />
            </Link>
          </div>

          {isLowStockLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <Table className="text-sm">
              <THead>
                <TH align="right">محصول</TH>
                <TH align="right">ویژگی</TH>
                <TH align="center">موجودی</TH>
                <TH align="center">حد مجاز</TH>
                <TH align="center">عملیات</TH>
              </THead>
              <TBody>
                {!lowStock || lowStock.length === 0 ? (
                  <TableEmpty colSpan={5} message="موجودی همه واریانت‌ها در حد مطلوب است" icon={MdiPackageVariant} />
                ) : (
                  lowStock.map((v) => (
                    <TRow key={v.variant_id} hover>
                      <TD align="right" cardSlot="header">
                        <span className="font-medium text-text-primary">{v.product_title}</span>
                      </TD>
                      <TD align="right" label="ویژگی">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {v.attributes.length > 0 ? (
                            v.attributes.map((attr, i) => (
                              <span key={i} className="inline-flex items-center gap-1 text-xs text-text-secondary">
                                {attr.color_code && (
                                  <span
                                    className="inline-block w-3 h-3 rounded-full border border-border"
                                    style={{ backgroundColor: attr.color_code }}
                                  />
                                )}
                                {attr.value}
                              </span>
                            ))
                          ) : (
                            <code className="text-xs text-text-muted">{v.sku}</code>
                          )}
                        </div>
                      </TD>
                      <TD align="center" label="موجودی">
                        <span className={v.stock_quantity === 0 ? "text-error font-medium" : "text-warning font-medium"}>
                          {toPersianDigits(v.stock_quantity)}
                        </span>
                      </TD>
                      <TD align="center" label="حد مجاز" className="text-text-secondary">
                        {v.low_stock_threshold != null ? toPersianDigits(v.low_stock_threshold) : '—'}
                      </TD>
                      <TD align="center" cardSlot="actions">
                        <Link
                          href={`/admin/products/${v.product_id}?tab=variants`}
                          className="text-sm text-primary hover:underline"
                        >
                          تأمین موجودی
                        </Link>
                      </TD>
                    </TRow>
                  ))
                )}
              </TBody>
            </Table>
          )}
        </div>
      </div>
    </AdminPage>
  );
}
