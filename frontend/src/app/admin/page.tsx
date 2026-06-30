// src/app/admin/page.tsx
'use client';

import Link from 'next/link';
import { useAdminRoute } from '@/modules/auth/hooks/useAdminRoute';
import { useDashboardStats, useLowStockVariants } from '@/modules/dashboard/hooks/useDashboard';
import AdminPage from '@/components/layout/AdminPage';
import { Badge, PageHeader, Skeleton, Table, TBody, TD, TableEmpty, TH, THead, TRow } from '@/components/ui';
import { formatPrice } from '@/utils/formatPrice';
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
} from '@/components/icons/Icons';

const quickLinks = [
  { title: 'محصولات', href: '/admin/products', icon: MdiPackageVariant },
  { title: 'سفارشات', href: '/admin/orders', icon: MdiCart },
  { title: 'کاربران', href: '/admin/users', icon: MdiAccountGroup },
  { title: 'تخفیف‌ها', href: '/admin/coupons', icon: MdiTicketPercent },
];

export default function AdminDashboardPage() {
  const { isLoading: isAuthLoading } = useAdminRoute();
  const { data: stats, isLoading } = useDashboardStats();
  const { data: lowStock, isLoading: isLowStockLoading } = useLowStockVariants();

  const kpis = [
    { label: 'درآمد کل (پرداخت‌شده)', value: stats ? `${formatPrice(stats.total_revenue)} تومان` : '—', icon: MdiStore, color: 'text-success bg-success-light' },
    { label: 'سفارشات', value: stats?.total_orders ?? '—', icon: MdiCart, color: 'text-primary bg-primary-light' },
    { label: 'سفارشات در انتظار', value: stats?.pending_orders ?? '—', icon: MdiAlertCircle, color: 'text-warning bg-warning-light' },
    { label: 'محصولات فعال', value: stats?.total_products ?? '—', icon: MdiPackageVariant, color: 'text-info bg-info-light' },
    { label: 'مشتریان', value: stats?.total_customers ?? '—', icon: MdiAccountGroup, color: 'text-primary bg-primary-light' },
    { label: 'موجودی کم', value: stats?.low_stock_count ?? '—', icon: MdiAlertCircle, color: 'text-error bg-error-light' },
  ];

  return (
    <AdminPage
      maxWidth="6xl"
      loading={isAuthLoading}
      header={<PageHeader title="داشبورد" subtitle="نمای کلی فروشگاه" icon={MdiViewDashboard} />}
    >
      <div className="space-y-8">
        {/* KPI cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {kpis.map((kpi) => (
            <div
              key={kpi.label}
              className="bg-surface rounded-card shadow-card p-5 flex items-center gap-4 hover:shadow-card-hover transition-shadow"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${kpi.color}`}>
                <kpi.icon className="w-7 h-7" />
              </div>
              <div className="min-w-0">
                <p className="text-text-muted text-xs mb-1.5">{kpi.label}</p>
                {isLoading ? (
                  <Skeleton className="h-7 w-24" />
                ) : (
                  <p className="text-2xl font-bold text-text-primary truncate">{kpi.value}</p>
                )}
              </div>
            </div>
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

        {/* Recent orders */}
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
                          {v.stock_quantity}
                        </span>
                      </TD>
                      <TD align="center" label="حد مجاز" className="text-text-secondary">
                        {v.low_stock_threshold}
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
