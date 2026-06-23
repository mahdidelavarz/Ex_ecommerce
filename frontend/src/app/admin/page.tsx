// src/app/admin/page.tsx
'use client';

import Link from 'next/link';
import { useAdminRoute } from '@/modules/auth/hooks/useAdminRoute';
import { useDashboardStats } from '@/modules/dashboard/hooks/useDashboard';
import AdminSidebar from '@/components/layout/AdminSidebar';
import { formatPrice } from '@/utils/formatPrice';
import {
  MdiCart,
  MdiPackageVariant,
  MdiAccountGroup,
  MdiTicketPercent,
  MdiAlertCircle,
  MdiStore,
  MdiChevronLeft,
  SvgSpinnersRingResize,
} from '@/components/icons/Icons';

const statusLabels: Record<string, string> = {
  pending: 'در انتظار', confirmed: 'تایید شده', processing: 'در حال پردازش',
  shipped: 'ارسال شده', delivered: 'تحویل شده', cancelled: 'لغو شده', returned: 'مرجوع شده',
};

const statusClasses: Record<string, string> = {
  pending: 'bg-warning-light text-warning', confirmed: 'bg-info-light text-info',
  processing: 'bg-info-light text-info', shipped: 'bg-primary-light text-primary',
  delivered: 'bg-success-light text-success', cancelled: 'bg-error-light text-error',
  returned: 'bg-error-light text-error',
};

const quickLinks = [
  { title: 'محصولات', href: '/admin/products', icon: MdiPackageVariant },
  { title: 'سفارشات', href: '/admin/orders', icon: MdiCart },
  { title: 'کاربران', href: '/admin/users', icon: MdiAccountGroup },
  { title: 'تخفیف‌ها', href: '/admin/coupons', icon: MdiTicketPercent },
];

export default function AdminDashboardPage() {
  const { isLoading: isAuthLoading } = useAdminRoute();
  const { data: stats, isLoading } = useDashboardStats();

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <SvgSpinnersRingResize className="text-primary" width={48} />
      </div>
    );
  }

  const kpis = [
    { label: 'درآمد کل (پرداخت‌شده)', value: stats ? `${formatPrice(stats.total_revenue)} تومان` : '—', icon: MdiStore, color: 'text-success bg-success-light' },
    { label: 'سفارشات', value: stats?.total_orders ?? '—', icon: MdiCart, color: 'text-primary bg-primary-light' },
    { label: 'سفارشات در انتظار', value: stats?.pending_orders ?? '—', icon: MdiAlertCircle, color: 'text-warning bg-warning-light' },
    { label: 'محصولات فعال', value: stats?.total_products ?? '—', icon: MdiPackageVariant, color: 'text-info bg-info-light' },
    { label: 'مشتریان', value: stats?.total_customers ?? '—', icon: MdiAccountGroup, color: 'text-primary bg-primary-light' },
    { label: 'موجودی کم', value: stats?.low_stock_count ?? '—', icon: MdiAlertCircle, color: 'text-error bg-error-light' },
  ];

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 lg:mr-64 p-4 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-text-primary mb-1">داشبورد</h1>
          <p className="text-text-secondary text-sm mb-8">نمای کلی فروشگاه</p>

          {/* KPI cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {kpis.map((kpi) => (
              <div key={kpi.label} className="bg-surface rounded-card shadow-card p-5 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${kpi.color}`}>
                  <kpi.icon className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <p className="text-text-muted text-xs mb-1">{kpi.label}</p>
                  {isLoading ? (
                    <div className="h-6 w-20 bg-surface-raised rounded animate-pulse-soft" />
                  ) : (
                    <p className="text-lg font-bold text-text-primary truncate">{kpi.value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Quick links */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="bg-surface rounded-card shadow-card p-4 flex flex-col items-center gap-2 hover:shadow-card-hover hover:border-primary border border-transparent transition-all"
              >
                <link.icon className="w-6 h-6 text-primary" />
                <span className="text-sm font-medium text-text-secondary">{link.title}</span>
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
                  <div key={i} className="h-12 bg-surface-raised rounded animate-pulse-soft" />
                ))}
              </div>
            ) : stats?.recent_orders.length === 0 ? (
              <p className="text-center text-text-secondary py-8 text-sm">هنوز سفارشی ثبت نشده است</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-text-muted text-xs border-b border-border">
                      <th className="text-right font-medium pb-3">شماره</th>
                      <th className="text-right font-medium pb-3">مشتری</th>
                      <th className="text-right font-medium pb-3">مبلغ</th>
                      <th className="text-right font-medium pb-3">وضعیت</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {stats?.recent_orders.map((order) => (
                      <tr key={order.id} className="hover:bg-surface-raised transition-colors">
                        <td className="py-3">
                          <Link href={`/admin/orders/${order.id}`} className="text-primary hover:underline font-medium">
                            {order.order_number}
                          </Link>
                        </td>
                        <td className="py-3 text-text-secondary">{order.customer_name}</td>
                        <td className="py-3 text-text-primary">{formatPrice(order.total_amount)}</td>
                        <td className="py-3">
                          <span className={`text-xs px-2 py-1 rounded-full ${statusClasses[order.order_status] ?? 'bg-surface-raised text-text-secondary'}`}>
                            {statusLabels[order.order_status] ?? order.order_status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
