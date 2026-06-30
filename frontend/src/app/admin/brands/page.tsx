// src/app/(admin)/admin/brands/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useBrands, useDeleteBrand } from "@/modules/brands/hooks/useBrands";
import { useAdminRoute } from "@/modules/auth/hooks/useAdminRoute";
import AdminPage from "@/components/layout/AdminPage";
import {
  Badge,
  EmptyState,
  Input,
  PageFilters,
  PageHeader,
  Pagination,
  RowActions,
  Skeleton,
} from "@/components/ui";
import type { Brand } from "@/modules/brands/types/brand.types";
import {
  LucidePencil,
  LucidePlus,
  LucideSearch,
  MdiCheckCircle,
  MdiCloseCircle,
  MdiTagOff,
  MdiTrashCan,
} from "@/components/icons/Icons";

export default function AdminBrandsPage() {
  const router = useRouter();
  const { isLoading: isAuthLoading } = useAdminRoute();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useBrands({
    page,
    limit: 20,
    search: search || undefined,
  });
  const deleteBrand = useDeleteBrand();

  const handleDelete = async (brand: Brand) => {
    if (!window.confirm(`آیا از حذف برند "${brand.name}" اطمینان دارید؟`))
      return;

    // success/error toasts are handled by the useDeleteBrand hook
    deleteBrand.mutate(brand.id);
  };

  return (
    <AdminPage
      maxWidth="7xl"
      loading={isAuthLoading}
      header={
        <PageHeader
          title="برندها"
          subtitle="مدیریت برندهای فروشگاه"
          action={{
            label: "برند جدید",
            icon: LucidePlus,
            onClick: () => router.push("/admin/brands/new"),
          }}
        />
      }
      filters={
        <PageFilters>
          <Input
            type="text"
            placeholder="جستجو در برندها..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            icon={LucideSearch}
          />
        </PageFilters>
      }
      footer={
        data?.meta && (
          <Pagination
            meta={data.meta}
            onPageChange={setPage}
            itemLabel="برند"
          />
        )
      }
    >
      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="bg-surface rounded-card shadow-card p-6">
              <div className="flex items-center gap-4">
                <Skeleton className="w-16 h-16 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            </div>
          ))
        ) : data?.data?.length === 0 ? (
          <div className="col-span-full">
            <EmptyState icon={MdiTagOff} title="برندی یافت نشد" />
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
    </AdminPage>
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
        <RowActions
          className="opacity-0 group-hover:opacity-100 transition-opacity"
          actions={[
            { icon: LucidePencil, title: "ویرایش", onClick: onEdit },
            {
              icon: MdiTrashCan,
              title: "حذف",
              variant: "error",
              onClick: onDelete,
            },
          ]}
        />
      </div>
      {brand.description && (
        <p className="text-sm text-text-secondary line-clamp-2">
          {brand.description}
        </p>
      )}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
        <span className="text-xs text-text-muted">
          {brand.products_count} محصول
        </span>
        <Badge
          variant={brand.is_active ? "success" : "error"}
          size="sm"
          icon={brand.is_active ? MdiCheckCircle : MdiCloseCircle}
        >
          {brand.is_active ? "فعال" : "غیرفعال"}
        </Badge>
      </div>
    </div>
  );
}
