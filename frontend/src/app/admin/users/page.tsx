// src/app/admin/users/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAdminRoute } from '@/modules/auth/hooks/useAdminRoute';
import { useUsers, useUpdateUserRole, useUpdateUserStatus } from '@/modules/users/hooks/useUsers';
import type { AdminUser, UserRole } from '@/modules/users/types/user.types';
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
  MdiAccount,
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
            <Input
              wrapperClassName="flex-1"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="جستجو بر اساس نام، تلفن یا ایمیل"
              icon={LucideSearch}
            />
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
          <Table className="text-sm">
            <THead>
              <TH align="right">کاربر</TH>
              <TH align="right">تماس</TH>
              <TH align="right">نقش</TH>
              <TH align="right">وضعیت</TH>
            </THead>
            <TBody>
              {isLoading ? (
                <TableSkeleton rows={6} columns={4} />
              ) : data?.data?.length === 0 ? (
                <TableEmpty colSpan={4} message="کاربری یافت نشد" icon={MdiAccount} />
              ) : (
                data?.data?.map((user: AdminUser) => (
                  <TRow key={user.id} hover>
                    <TD align="right" label="کاربر">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-primary-light rounded-full flex items-center justify-center shrink-0">
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
                    </TD>
                    <TD align="right" label="تماس" className="text-text-secondary">
                      <div>
                        <p>{user.phone_number || '—'}</p>
                        {user.email && <p className="text-xs text-text-muted">{user.email}</p>}
                      </div>
                    </TD>
                    <TD align="right" label="نقش">
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
                    </TD>
                    <TD align="right" label="وضعیت">
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
                    </TD>
                  </TRow>
                ))
              )}
            </TBody>
          </Table>

          {/* Pagination */}
          {data?.meta && (
            <Pagination meta={data.meta} onPageChange={setPage} itemLabel="کاربر" className="mt-6" />
          )}
        </div>
      </main>
    </div>
  );
}
