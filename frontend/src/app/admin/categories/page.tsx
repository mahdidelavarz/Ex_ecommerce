// src/app/(admin)/admin/categories/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useCategories } from "@/modules/categories/hooks/useCategories";
import { categoryService } from "@/modules/categories/services/category.service";
import { useAdminRoute } from "@/modules/auth/hooks/useAdminRoute";
import AdminSidebar from "@/components/layout/AdminSidebar";
import Button from "@/components/ui/Button";
import type { Category } from "@/modules/categories/types/category.types";
import {
  LucidePencil,
  LucidePlus,
  LucideSearch,
  MdiCheckCircle,
  MdiChevronLeft,
  MdiChevronRight,
  MdiCloseCircle,
  MdiFolderOpenOutline,
  MdiTrashCan,
  SolarFolderWithFilesBold,
  SvgSpinnersRingResize,
} from "@/components/icons/Icons";

export default function AdminCategoriesPage() {
  const router = useRouter();
  const { isLoading: isAuthLoading } = useAdminRoute();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [parentFilter, setParentFilter] = useState<string | null>(null);

  const { data, isLoading, refetch } = useCategories({
    page,
    limit: 20,
    search: search || undefined,
    parent_id: parentFilter,
  });

  const handleDelete = async (category: Category) => {
    const confirmMessage =
      category.children_count > 0
        ? `این دسته‌بندی ${category.children_count} زیرمجموعه دارد. با حذف اجباری، زیرمجموعه‌ها نیز حذف می‌شوند. ادامه می‌دهید؟`
        : "آیا از حذف این دسته‌بندی اطمینان دارید؟";

    if (!window.confirm(confirmMessage)) return;

    try {
      await categoryService.delete(category.id, category.children_count > 0);
      toast.success("دسته‌بندی با موفقیت حذف شد");
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "خطا در حذف دسته‌بندی");
    }
  };

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <SvgSpinnersRingResize
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
              <h1 className="text-2xl font-bold text-text-primary">
                دسته‌بندی‌ها
              </h1>
              <p className="text-text-secondary mt-1">
                مدیریت دسته‌بندی‌های فروشگاه
              </p>
            </div>
            <Button
              onClick={() => router.push("/admin/categories/new")}
              icon={LucidePlus}
            >
              دسته‌بندی جدید
            </Button>
          </div>

          {/* Filters */}
          <div className="bg-surface rounded-card shadow-card p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <LucideSearch
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"
                  width={20}
                />
                <input
                  type="text"
                  placeholder="جستجو در دسته‌بندی‌ها..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pr-10 pl-4 py-2 bg-surface border border-border rounded-input text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <select
                value={parentFilter || ""}
                onChange={(e) => {
                  setParentFilter(e.target.value || null);
                  setPage(1);
                }}
                className="px-4 py-2 bg-surface border border-border rounded-input text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">همه دسته‌بندی‌ها</option>
                <option value="null">دسته‌های اصلی</option>
                {data?.data?.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-surface rounded-card shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-surface-raised">
                    <th className="text-right px-4 py-3 text-sm font-medium text-text-secondary">
                      نام
                    </th>
                    <th className="text-right px-4 py-3 text-sm font-medium text-text-secondary hidden md:table-cell">
                      اسلاگ
                    </th>
                    <th className="text-center px-4 py-3 text-sm font-medium text-text-secondary hidden sm:table-cell">
                      زیرمجموعه
                    </th>
                    <th className="text-center px-4 py-3 text-sm font-medium text-text-secondary hidden sm:table-cell">
                      محصولات
                    </th>
                    <th className="text-center px-4 py-3 text-sm font-medium text-text-secondary">
                      وضعیت
                    </th>
                    <th className="text-center px-4 py-3 text-sm font-medium text-text-secondary">
                      عملیات
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i} className="border-b border-border">
                        <td className="px-4 py-3">
                          <div className="h-4 bg-surface-raised rounded animate-pulse-soft" />
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <div className="h-4 bg-surface-raised rounded animate-pulse-soft" />
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <div className="h-4 bg-surface-raised rounded animate-pulse-soft" />
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <div className="h-4 bg-surface-raised rounded animate-pulse-soft" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="h-4 bg-surface-raised rounded animate-pulse-soft" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="h-4 bg-surface-raised rounded animate-pulse-soft" />
                        </td>
                      </tr>
                    ))
                  ) : data?.data?.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12">
                        <MdiFolderOpenOutline
                          className="text-text-muted mx-auto mb-3"
                          width={48}
                        />
                        <p className="text-text-secondary">
                          دسته‌بندی یافت نشد
                        </p>
                      </td>
                    </tr>
                  ) : (
                    data?.data?.map((category) => (
                      <tr
                        key={category.id}
                        className="border-b border-border hover:bg-surface-raised/50 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {category.image ? (
                              <img
                                src={category.image}
                                alt={category.name}
                                className="w-10 h-10 rounded-lg object-cover"
                              />
                            ) : (
                              <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center"
                                style={{
                                  backgroundColor:
                                    category.color ||
                                    "var(--color-primary-light)",
                                }}
                              >
                                <SolarFolderWithFilesBold className="w-5 h-5 text-white" />
                                {/* dynamic icon must add */}
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-text-primary">
                                {category.name}
                              </p>
                              <p className="text-xs text-text-muted">
                                ترتیب: {category.sort_order}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <code className="text-xs bg-surface-raised px-2 py-1 rounded text-text-secondary">
                            {category.slug}
                          </code>
                        </td>
                        <td className="px-4 py-3 text-center hidden sm:table-cell">
                          <span className="text-text-secondary">
                            {category.children_count}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center hidden sm:table-cell">
                          <span className="text-text-secondary">
                            {category.products_count}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`
                              inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                              ${
                                category.is_active
                                  ? "bg-success-light text-success"
                                  : "bg-error-light text-error"
                              }
                            `}
                          >
                            {category.is_active ? (
                              <MdiCheckCircle className="w-3 h-3" />
                            ) : (
                              <MdiCloseCircle className="w-3 h-3" />
                            )}

                            {category.is_active ? "فعال" : "غیرفعال"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() =>
                                router.push(`/admin/categories/${category.id}`)
                              }
                              className="p-2 hover:bg-primary-light rounded-button transition-colors text-primary"
                              title="ویرایش"
                            >
                              <LucidePencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(category)}
                              className="p-2 hover:bg-error-light rounded-button transition-colors text-error"
                              title="حذف"
                            >
                              <MdiTrashCan className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {data?.meta && data.meta.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                <p className="text-sm text-text-secondary">
                  نمایش {(data.meta.page - 1) * data.meta.limit + 1} تا{" "}
                  {Math.min(data.meta.page * data.meta.limit, data.meta.total)}{" "}
                  از {data.meta.total}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 hover:bg-surface-raised rounded-button transition-colors disabled:opacity-50"
                  >
                    <MdiChevronRight className="w-5 h-5" />
                  </button>
                  {Array.from(
                    { length: data.meta.totalPages },
                    (_, i) => i + 1,
                  ).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`
                        w-10 h-10 rounded-button text-sm font-medium transition-colors
                        ${
                          p === page
                            ? "bg-primary text-white"
                            : "text-text-secondary hover:bg-surface-raised"
                        }
                      `}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() =>
                      setPage((p) => Math.min(data.meta.totalPages, p + 1))
                    }
                    disabled={page === data.meta.totalPages}
                    className="p-2 hover:bg-surface-raised rounded-button transition-colors disabled:opacity-50"
                  >
                    <MdiChevronLeft className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
