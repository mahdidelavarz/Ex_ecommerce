// src/app/(admin)/admin/brands/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import toast from 'react-hot-toast';
import { useBrands } from '@/modules/brands/hooks/useBrands';
import { brandService } from '@/modules/brands/services/brand.service';
import { useAdminRoute } from '@/modules/auth/hooks/useAdminRoute';
import AdminSidebar from '@/components/layout/AdminSidebar';
import Button from '@/components/ui/Button';
import type { Brand } from '@/modules/brands/types/brand.types';

export default function AdminBrandsPage() {
  const router = useRouter();
  const { isLoading: isAuthLoading } = useAdminRoute();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading, refetch } = useBrands({
    page,
    limit: 20,
    search: search || undefined,
  });

  const handleDelete = async (brand: Brand) => {
    if (!window.confirm(`آیا از حذف برند "${brand.name}" اطمینان دارید؟`)) return;

    try {
      await brandService.delete(brand.id);
      toast.success('برند با موفقیت حذف شد');
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'خطا در حذف برند');
    }
  };

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Icon icon="mdi:loading" className="animate-spin text-primary" width={48} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />

      <main className="flex-1 lg:mr-64 p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-text-primary">برندها</h1>
              <p className="text-text-secondary mt-1">مدیریت برندهای فروشگاه</p>
            </div>
            <Button onClick={() => router.push('/admin/brands/new')} icon="mdi:plus">
              برند جدید
            </Button>
          </div>

          {/* Search */}
          <div className="bg-surface rounded-card shadow-card p-4 mb-6">
            <div className="relative">
              <Icon
                icon="mdi:search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"
                width={20}
              />
              <input
                type="text"
                placeholder="جستجو در برندها..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pr-10 pl-4 py-2 bg-surface border border-border rounded-input text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
              [...Array(6)].map((_, i) => (
                <div key={i} className="bg-surface rounded-card shadow-card p-6 animate-pulse-soft">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-surface-raised rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-surface-raised rounded w-3/4" />
                      <div className="h-3 bg-surface-raised rounded w-1/2" />
                    </div>
                  </div>
                </div>
              ))
            ) : data?.data?.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Icon icon="mdi:tag-off" className="text-text-muted mx-auto mb-3" width={48} />
                <p className="text-text-secondary">برندی یافت نشد</p>
              </div>
            ) : (
              data?.data?.map((brand) => (
                <BrandCard
                  key={brand.id}
                  brand={brand}
                  onEdit={() => router.push(`/admin/brands/${brand.id}`)}
                  onDelete={() => handleDelete(brand)}
                />
              ))
            )}
          </div>

          {/* Pagination */}
          {data?.meta && data.meta.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 bg-surface rounded-card shadow-card px-4 py-3">
              <p className="text-sm text-text-secondary">
                {data.meta.total} برند
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 hover:bg-surface-raised rounded-button transition-colors disabled:opacity-50"
                >
                  <Icon icon="mdi:chevron-right" className="w-5 h-5" />
                </button>
                {Array.from({ length: data.meta.totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-10 h-10 rounded-button text-sm font-medium transition-colors ${
                      p === page
                        ? 'bg-primary text-white'
                        : 'text-text-secondary hover:bg-surface-raised'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(data.meta.totalPages, p + 1))}
                  disabled={page === data.meta.totalPages}
                  className="p-2 hover:bg-surface-raised rounded-button transition-colors disabled:opacity-50"
                >
                  <Icon icon="mdi:chevron-left" className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function BrandCard({
  brand,
  onEdit,
  onDelete,
}: {
  brand: Brand;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="bg-surface rounded-card shadow-card hover:shadow-card-hover transition-all duration-200 p-6 group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          {brand.logo ? (
            <img
              src={brand.logo}
              alt={brand.name}
              className="w-16 h-16 rounded-xl object-cover border border-border"
            />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-primary-light flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">
                {brand.name.charAt(0)}
              </span>
            </div>
          )}
          <div>
            <h3 className="font-bold text-text-primary">{brand.name}</h3>
            <code className="text-xs text-text-muted bg-surface-raised px-2 py-0.5 rounded mt-1 inline-block">
              {brand.slug}
            </code>
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onEdit}
            className="p-2 hover:bg-primary-light rounded-button transition-colors text-primary"
            title="ویرایش"
          >
            <Icon icon="mdi:pencil" className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 hover:bg-error-light rounded-button transition-colors text-error"
            title="حذف"
          >
            <Icon icon="mdi:delete" className="w-4 h-4" />
          </button>
        </div>
      </div>
      {brand.description && (
        <p className="text-sm text-text-secondary line-clamp-2">{brand.description}</p>
      )}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
        <span className="text-xs text-text-muted">
          {brand.products_count} محصول
        </span>
        <span
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            brand.is_active
              ? 'bg-success-light text-success'
              : 'bg-error-light text-error'
          }`}
        >
          <Icon
            icon={brand.is_active ? 'mdi:check-circle' : 'mdi:close-circle'}
            className="w-3 h-3"
          />
          {brand.is_active ? 'فعال' : 'غیرفعال'}
        </span>
      </div>
    </div>
  );
}