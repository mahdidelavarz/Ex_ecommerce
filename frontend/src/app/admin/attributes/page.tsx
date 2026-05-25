// src/app/(admin)/admin/attributes/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import { useAttributes } from "@/modules/attributes/hooks/useAttributes";
import { attributeService } from "@/modules/attributes/services/attribute.service";
import { useAdminRoute } from "@/modules/auth/hooks/useAdminRoute";
import AdminSidebar from "@/components/layout/AdminSidebar";
import Button from "@/components/ui/Button";
import type { Attribute } from "@/modules/attributes/types/attribute.types";
import { LucidePlus } from "@/components/icons/Icons";

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

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Icon
          icon="mdi:loading"
          className="animate-spin text-primary"
          width={48}
        />
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
              <h1 className="text-2xl font-bold text-text-primary">ویژگی‌ها</h1>
              <p className="text-text-secondary mt-1">
                مدیریت ویژگی‌های محصولات (رنگ، سایز، حافظه و...)
              </p>
            </div>
            <Button
              onClick={() => router.push("/admin/attributes/new")}
              icon={LucidePlus}
            >
              ویژگی جدید
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
                placeholder="جستجو در ویژگی‌ها..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pr-10 pl-4 py-2 bg-surface border border-border rounded-input text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Attributes Cards */}
          <div className="space-y-4">
            {isLoading ? (
              [...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="bg-surface rounded-card shadow-card p-6 animate-pulse-soft"
                >
                  <div className="h-5 bg-surface-raised rounded w-1/4 mb-4" />
                  <div className="flex gap-3">
                    {[...Array(4)].map((_, j) => (
                      <div
                        key={j}
                        className="h-10 bg-surface-raised rounded-lg w-24"
                      />
                    ))}
                  </div>
                </div>
              ))
            ) : data?.data?.length === 0 ? (
              <div className="text-center py-12">
                <Icon
                  icon="mdi:shape-plus-outline"
                  className="text-text-muted mx-auto mb-3"
                  width={48}
                />
                <p className="text-text-secondary">ویژگی یافت نشد</p>
              </div>
            ) : (
              data?.data?.map((attribute) => (
                <AttributeCard
                  key={attribute.id}
                  attribute={attribute}
                  onEdit={() =>
                    router.push(`/admin/attributes/${attribute.id}`)
                  }
                  onDelete={() => handleDelete(attribute)}
                  onDeleteValue={(valueId, valueName) =>
                    handleDeleteValue(attribute.id, valueId, valueName)
                  }
                />
              ))
            )}
          </div>

          {/* Pagination */}
          {data?.meta && data.meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 hover:bg-surface-raised rounded-button disabled:opacity-50"
              >
                <Icon icon="mdi:chevron-right" className="w-5 h-5" />
              </button>
              {Array.from(
                { length: data.meta.totalPages },
                (_, i) => i + 1,
              ).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-10 h-10 rounded-button text-sm font-medium ${p === page ? "bg-primary text-white" : "text-text-secondary hover:bg-surface-raised"}`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() =>
                  setPage((p) => Math.min(data.meta.totalPages, p + 1))
                }
                disabled={page === data.meta.totalPages}
                className="p-2 hover:bg-surface-raised rounded-button disabled:opacity-50"
              >
                <Icon icon="mdi:chevron-left" className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
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
          <Icon icon="mdi:shape" className="w-6 h-6 text-primary" />
          <h3 className="text-lg font-bold text-text-primary">
            {attribute.name}
          </h3>
          <span className="text-sm text-text-muted">
            ({attribute.values_count} مقدار)
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onEdit}
            className="p-2 hover:bg-primary-light rounded-button text-primary"
            title="ویرایش"
          >
            <Icon icon="mdi:pencil" className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 hover:bg-error-light rounded-button text-error"
            title="حذف"
          >
            <Icon icon="mdi:delete" className="w-4 h-4" />
          </button>
        </div>
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
              <Icon icon="mdi:close" className="w-3 h-3" />
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
