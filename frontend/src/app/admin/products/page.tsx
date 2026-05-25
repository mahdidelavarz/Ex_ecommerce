// src/app/(admin)/admin/products/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useProducts } from "@/modules/products/hooks/useProducts";
import { useCategories } from "@/modules/categories/hooks/useCategories";
import { useAllBrands } from "@/modules/brands/hooks/useBrands";
import { productService } from "@/modules/products/services/product.service";
import { useAdminRoute } from "@/modules/auth/hooks/useAdminRoute";
import AdminSidebar from "@/components/layout/AdminSidebar";
import Button from "@/components/ui/Button";
import { formatPrice } from "@/utils/formatPrice";
import type { ProductListResponse } from "@/modules/products/types/product.types";
import {
  LucidePencil,
  LucidePlus,
  LucideSearch,
  MdiChevronLeft,
  MdiChevronRight,
  MdiImageOff,
  MdiPackageVariantClosed,
  MdiTrashCan,
  SvgSpinnersRingResize,
} from "@/components/icons/Icons";

export default function AdminProductsPage() {
  const router = useRouter();
  const { isLoading: isAuthLoading } = useAdminRoute();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const { data: categoriesData } = useCategories({ limit: 100 });
  const { data: brandsData } = useAllBrands();

  const { data, isLoading, refetch } = useProducts({
    page,
    limit: 20,
    search: search || undefined,
    category_id: categoryFilter || undefined,
    brand_id: brandFilter || undefined,
    is_public: undefined, // Show all in admin
  });

  const handleDelete = async (product: ProductListResponse) => {
    if (!window.confirm(`آیا از حذف "${product.title}" اطمینان دارید؟`)) return;
    try {
      await productService.delete(product.id);
      toast.success("محصول با موفقیت حذف شد");
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "خطا در حذف محصول");
    }
  };

  const handleBulkStatus = async (is_active: boolean) => {
    if (selectedIds.size === 0) return;
    try {
      await productService.bulkStatus(Array.from(selectedIds), is_active);
      toast.success("وضعیت محصولات بروزرسانی شد");
      setSelectedIds(new Set());
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "خطا در بروزرسانی");
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    newSet.has(id) ? newSet.delete(id) : newSet.add(id);
    setSelectedIds(newSet);
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
              <h1 className="text-2xl font-bold text-text-primary">محصولات</h1>
              <p className="text-text-secondary mt-1">مدیریت محصولات فروشگاه</p>
            </div>
            <Button
              onClick={() => router.push("/admin/products/new")}
              icon={LucidePlus}
            >
              محصول جدید
            </Button>
          </div>

          {/* Filters */}
          <div className="bg-surface rounded-card shadow-card p-4 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="relative">
                <LucideSearch
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"
                  width={20}
                />
                <input
                  type="text"
                  placeholder="جستجو..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pr-10 pl-4 py-2 bg-surface border border-border rounded-input text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setPage(1);
                }}
                className="px-4 py-2 bg-surface border border-border rounded-input text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">همه دسته‌ها</option>
                {categoriesData?.data?.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <select
                value={brandFilter}
                onChange={(e) => {
                  setBrandFilter(e.target.value);
                  setPage(1);
                }}
                className="px-4 py-2 bg-surface border border-border rounded-input text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">همه برندها</option>
                {brandsData?.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedIds.size > 0 && (
            <div className="bg-primary-light rounded-card p-3 mb-4 flex items-center gap-3">
              <span className="text-sm text-primary font-medium">
                {selectedIds.size} محصول انتخاب شده
              </span>
              <Button size="sm" onClick={() => handleBulkStatus(true)}>
                فعال کردن
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkStatus(false)}
              >
                غیرفعال کردن
              </Button>
            </div>
          )}

          {/* Table */}
          <div className="bg-surface rounded-card shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-surface-raised">
                    <th className="px-4 py-3 w-10">
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIds(
                              new Set(data?.data?.map((p) => p.id) || []),
                            );
                          } else {
                            setSelectedIds(new Set());
                          }
                        }}
                        className="rounded"
                      />
                    </th>
                    <th className="text-right px-4 py-3 text-sm font-medium text-text-secondary">
                      محصول
                    </th>
                    <th className="text-center px-4 py-3 text-sm font-medium text-text-secondary hidden md:table-cell">
                      قیمت
                    </th>
                    <th className="text-center px-4 py-3 text-sm font-medium text-text-secondary hidden lg:table-cell">
                      موجودی
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
                        <td className="px-4 py-3">
                          <div className="h-4 bg-surface-raised rounded animate-pulse-soft" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="h-4 bg-surface-raised rounded animate-pulse-soft" />
                        </td>
                        <td className="px-4 py-3">
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
                        <MdiPackageVariantClosed
                          className="text-text-muted mx-auto mb-3"
                          width={48}
                        />
                        <p className="text-text-secondary">محصولی یافت نشد</p>
                      </td>
                    </tr>
                  ) : (
                    data?.data?.map((product) => (
                      <tr
                        key={product.id}
                        className="border-b border-border hover:bg-surface-raised/50 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(product.id)}
                            onChange={() => toggleSelect(product.id)}
                            className="rounded"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {product.thumbnail ? (
                              <img
                                src={product.thumbnail}
                                alt={product.title}
                                className="w-10 h-10 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-surface-raised flex items-center justify-center">
                                <MdiImageOff className="w-5 h-5 text-text-muted" />
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-text-primary text-sm">
                                {product.title}
                              </p>
                              <p className="text-xs text-text-muted">
                                {product.category?.name}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center hidden md:table-cell">
                          <span className="text-sm text-text-primary">
                            {product.price_range.min > 0
                              ? formatPrice(product.price_range.min)
                              : "-"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center hidden lg:table-cell">
                          <span
                            className={`text-sm ${product.total_stock === 0 ? "text-error" : "text-success"}`}
                          >
                            {product.total_stock}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                              product.is_active
                                ? "bg-success-light text-success"
                                : "bg-error-light text-error"
                            }`}
                          >
                            {product.is_active ? "فعال" : "غیرفعال"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() =>
                                router.push(`/admin/products/${product.id}`)
                              }
                              className="p-2 hover:bg-primary-light rounded-button text-primary"
                              title="ویرایش"
                            >
                              <LucidePencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(product)}
                              className="p-2 hover:bg-error-light rounded-button text-error"
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
                  {data.meta.total} محصول
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 hover:bg-surface-raised rounded-button disabled:opacity-50"
                  >
                    <MdiChevronRight className="w-5 h-5" />
                  </button>
                  {Array.from({ length: data.meta.totalPages }, (_, i) => i + 1)
                    .slice(
                      Math.max(0, page - 3),
                      Math.min(data.meta.totalPages, page + 2),
                    )
                    .map((p) => (
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
