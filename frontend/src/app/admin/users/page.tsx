// src/app/admin/users/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAdminRoute } from '@/modules/auth/hooks/useAdminRoute';
import { useUsers, useUpdateUserRole, useUpdateUserStatus } from '@/modules/users/hooks/useUsers';
import type { AdminUser, UserRole } from '@/modules/users/types/user.types';
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
  MdiAccount,
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

const roleFilterOptions = [
  { value: 'customer', label: roleLabels.customer },
  { value: 'admin', label: roleLabels.admin },
  { value: 'support', label: roleLabels.support },
];

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

  return (
    <AdminPage
      maxWidth="5xl"
      loading={isAuthLoading}
      header={<PageHeader title="کاربران" />}
      filters={
        <PageFilters>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              wrapperClassName="sm:col-span-2"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="جستجو بر اساس نام، تلفن یا ایمیل"
              icon={LucideSearch}
            />
            <Select
              value={roleFilter === 'all' ? '' : roleFilter}
              onChange={(e) => {
                setRoleFilter((e.target.value || 'all') as RoleFilter);
                setPage(1);
              }}
              placeholder="همه نقش‌ها"
              options={roleFilterOptions}
            />
          </div>
        </PageFilters>
      }
      footer={
        data?.meta && (
          <Pagination
            meta={data.meta}
            onPageChange={setPage}
            itemLabel="کاربر"
          />
        )
      }
    >
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
                    <TD align="right" cardSlot="header">
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
    </AdminPage>
  );
}
