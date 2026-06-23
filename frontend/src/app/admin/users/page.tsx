// src/app/admin/users/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAdminRoute } from '@/modules/auth/hooks/useAdminRoute';
import { useUsers, useUpdateUserRole, useUpdateUserStatus } from '@/modules/users/hooks/useUsers';
import type { AdminUser, UserRole } from '@/modules/users/types/user.types';
import AdminSidebar from '@/components/layout/AdminSidebar';
import {
  LucideSearch,
  MdiAccount,
  MdiChevronLeft,
  MdiChevronRight,
  SvgSpinnersRingResize,
} from '@/components/icons/Icons';

const roleLabels: Record<UserRole, string> = {
  customer: 'مشتری',
  admin: 'مدیر',
  support: 'پشتیبانی',
};

const roleClasses: Record<UserRole, string> = {
  customer: 'bg-info-light text-info',
  admin: 'bg-primary-light text-primary',
  support: 'bg-warning-light text-warning',
};

type RoleFilter = 'all' | UserRole;

export default function AdminUsersPage() {
  const { isLoading: isAuthLoading } = useAdminRoute();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data, isLoading } = useUsers({
    page,
    limit: 20,
    ...(search && { search }),
    ...(roleFilter !== 'all' && { role: roleFilter }),
  });

  const updateRole = useUpdateUserRole();
  const updateStatus = useUpdateUserStatus();

  const handleRoleChange = (user: AdminUser, role: UserRole) => {
    if (role === user.role) return;
    updateRole.mutate({ id: user.id, role });
  };

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
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold text-text-primary mb-6">کاربران</h1>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <LucideSearch className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="جستجو بر اساس نام، تلفن یا ایمیل"
                className="w-full pr-10 pl-4 py-2 bg-surface border border-border rounded-input text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex gap-2">
              {(['all', 'customer', 'admin', 'support'] as RoleFilter[]).map((r) => (
                <button
                  key={r}
                  onClick={() => { setRoleFilter(r); setPage(1); }}
                  className={`px-3 py-2 rounded-button text-sm font-medium transition-colors whitespace-nowrap ${
                    roleFilter === r
                      ? 'bg-primary text-white'
                      : 'bg-surface border border-border text-text-secondary hover:bg-surface-raised'
                  }`}
                >
                  {r === 'all' ? 'همه' : roleLabels[r]}
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
              <p className="text-center text-text-secondary py-12 text-sm">کاربری یافت نشد</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-text-muted text-xs border-b border-border bg-surface-raised/50">
                      <th className="text-right font-medium p-4">کاربر</th>
                      <th className="text-right font-medium p-4">تماس</th>
                      <th className="text-right font-medium p-4">نقش</th>
                      <th className="text-right font-medium p-4">وضعیت</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {data?.data?.map((user: AdminUser) => (
                      <tr key={user.id} className="hover:bg-surface-raised/50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-primary-light rounded-full flex items-center justify-center flex-shrink-0">
                              <MdiAccount className="w-5 h-5 text-primary" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-text-primary truncate">
                                {user.full_name || 'بدون نام'}
                              </p>
                              <p className="text-xs text-text-muted">
                                {new Date(user.created_at).toLocaleDateString('fa-IR')}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-text-secondary">
                          <p>{user.phone_number || '—'}</p>
                          {user.email && <p className="text-xs text-text-muted">{user.email}</p>}
                        </td>
                        <td className="p-4">
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user, e.target.value as UserRole)}
                            disabled={updateRole.isPending}
                            className={`text-xs font-medium px-2 py-1 rounded-full border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary ${roleClasses[user.role]}`}
                          >
                            <option value="customer">{roleLabels.customer}</option>
                            <option value="support">{roleLabels.support}</option>
                            <option value="admin">{roleLabels.admin}</option>
                          </select>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => updateStatus.mutate({ id: user.id, is_active: !user.is_active })}
                            disabled={updateStatus.isPending}
                            className={`text-xs font-medium px-3 py-1 rounded-full transition-colors ${
                              user.is_active
                                ? 'bg-success-light text-success hover:bg-success-light/70'
                                : 'bg-error-light text-error hover:bg-error-light/70'
                            }`}
                            title="کلیک برای تغییر وضعیت"
                          >
                            {user.is_active ? 'فعال' : 'غیرفعال'}
                          </button>
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
