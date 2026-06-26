// src/app/(admin)/admin/attributes/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAttributes } from "@/modules/attributes/hooks/useAttributes";
import { attributeService } from "@/modules/attributes/services/attribute.service";
import { useAdminRoute } from "@/modules/auth/hooks/useAdminRoute";
import AdminPage from "@/components/layout/AdminPage";
import {
  EmptyState,
  Input,
  PageFilters,
  PageHeader,
  Pagination,
  RowActions,
  Skeleton,
} from "@/components/ui";
import type { Attribute } from "@/modules/attributes/types/attribute.types";
import {
  LucidePencil,
  LucidePlus,
  LucideSearch,
  MdiClose,
  MdiShape,
  MdiTrashCan,
} from "@/components/icons/Icons";

export default function AdminAttributesPage() {
  const router = useRouter();
  const { isLoading: isAuthLoading } = useAdminRoute();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading, refetch } = useAttributes({
    page,
    limit: 20,
    search: search || undefined,
  });

  const handleDelete = async (attribute: Attribute) => {
    if (!window.confirm(`آیا از حذف ویژگی "${attribute.name}" اطمینان دارید؟`))
      return;
    try {
      await attributeService.delete(attribute.id);
      toast.success("ویژگی با موفقیت حذف شد");
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "خطا در حذف ویژگی");
    }
  };

  const handleDeleteValue = async (
    attributeId: string,
    valueId: string,
    valueName: string,
  ) => {
    if (!window.confirm(`آیا از حذف "${valueName}" اطمینان دارید؟`)) return;
    try {
      await attributeService.deleteValue(valueId);
      toast.success("مقدار حذف شد");
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "خطا در حذف مقدار");
    }
  };

  return (
    <AdminPage
      maxWidth="7xl"
      loading={isAuthLoading}
      header={
        <PageHeader
          title="ویژگی‌ها"
          subtitle="مدیریت ویژگی‌های محصولات (رنگ، سایز، حافظه و...)"
          action={{
            label: "ویژگی جدید",
            icon: LucidePlus,
            onClick: () => router.push("/admin/attributes/new"),
          }}
        />
      }
      filters={
        <PageFilters>
          <Input
            type="text"
            placeholder="جستجو در ویژگی‌ها..."
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
            itemLabel="ویژگی"
          />
        )
      }
    >
      {/* Attributes Cards */}
      <div className="space-y-4">
        {isLoading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="bg-surface rounded-card shadow-card p-6">
              <Skeleton className="h-5 w-1/4 mb-4" />
              <div className="flex gap-3">
                {[...Array(4)].map((_, j) => (
                  <Skeleton key={j} className="h-10 w-24 rounded-lg" />
                ))}
              </div>
            </div>
          ))
        ) : data?.data?.length === 0 ? (
          <EmptyState icon={MdiShape} title="ویژگی یافت نشد" />
        ) : (
          data?.data?.map((attribute) => (
            <AttributeCard
              key={attribute.id}
              attribute={attribute}
              onEdit={() => router.push(`/admin/attributes/${attribute.id}`)}
              onDelete={() => handleDelete(attribute)}
              onDeleteValue={(valueId, valueName) =>
                handleDeleteValue(attribute.id, valueId, valueName)
              }
            />
          ))
        )}
      </div>
    </AdminPage>
  );
}

function AttributeCard({
  attribute,
  onEdit,
  onDelete,
  onDeleteValue,
}: {
  attribute: Attribute;
  onEdit: () => void;
  onDelete: () => void;
  onDeleteValue: (valueId: string, valueName: string) => void;
}) {
  return (
    <div className="bg-surface rounded-card shadow-card hover:shadow-card-hover transition-all p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <MdiShape className="w-6 h-6 text-primary" />
          <h3 className="text-lg font-bold text-text-primary">
            {attribute.name}
          </h3>
          <span className="text-sm text-text-muted">
            ({attribute.values_count} مقدار)
          </span>
        </div>
        <RowActions
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

      {/* Values */}
      <div className="flex flex-wrap gap-2">
        {attribute.values?.map((value) => (
          <div
            key={value.id}
            className="flex items-center gap-2 bg-surface-raised rounded-lg px-3 py-2 group relative"
          >
            {value.color_code && (
              <span
                className="w-4 h-4 rounded-full border border-border"
                style={{ backgroundColor: value.color_code }}
              />
            )}
            <span className="text-sm text-text-primary">{value.value}</span>
            {value.color_code && (
              <code className="text-xs text-text-muted">
                {value.color_code}
              </code>
            )}
            <button
              onClick={() => onDeleteValue(value.id, value.value)}
              className="absolute -top-2 -left-2 w-5 h-5 bg-error text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              title="حذف"
            >
              <MdiClose className="w-3 h-3" />
            </button>
          </div>
        ))}
        {(!attribute.values || attribute.values.length === 0) && (
          <p className="text-sm text-text-muted">بدون مقدار</p>
        )}
      </div>
    </div>
  );
}
