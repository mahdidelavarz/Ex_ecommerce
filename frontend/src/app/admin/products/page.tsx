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
import {
  Badge,
  Button,
  Checkbox,
  Input,
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
} from "@/components/ui";
import { formatPrice } from "@/utils/formatPrice";
import type { ProductListResponse } from "@/modules/products/types/product.types";
import {
  LucidePencil,
  LucidePlus,
  LucideSearch,
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
          className="  text-primary"
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
              <Input
                type="text"
                placeholder="جستجو..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                icon={LucideSearch}
              />
              <Select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">همه دسته‌ها</option>
                {categoriesData?.data?.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </Select>
              <Select
                value={brandFilter}
                onChange={(e) => {
                  setBrandFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">همه برندها</option>
                {brandsData?.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </Select>
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
          <Table>
            <THead>
              <TH className="w-10">
                <Checkbox
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedIds(new Set(data?.data?.map((p) => p.id) || []));
                    } else {
                      setSelectedIds(new Set());
                    }
                  }}
                />
              </TH>
              <TH align="right">محصول</TH>
              <TH align="center" hideBelow="md">قیمت</TH>
              <TH align="center" hideBelow="lg">موجودی</TH>
              <TH align="center">وضعیت</TH>
              <TH align="center">عملیات</TH>
            </THead>
            <TBody>
              {isLoading ? (
                <TableSkeleton rows={5} columns={6} />
              ) : data?.data?.length === 0 ? (
                <TableEmpty colSpan={6} message="محصولی یافت نشد" icon={MdiPackageVariantClosed} />
              ) : (
                data?.data?.map((product) => (
                  <TRow key={product.id} hover>
                    <TD label="">
                      <Checkbox
                        checked={selectedIds.has(product.id)}
                        onChange={() => toggleSelect(product.id)}
                      />
                    </TD>
                    <TD align="right" label="محصول">
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
                          <p className="font-medium text-text-primary text-sm">{product.title}</p>
                          <p className="text-xs text-text-muted">{product.category?.name}</p>
                        </div>
                      </div>
                    </TD>
                    <TD align="center" label="قیمت" hideBelow="md" className="text-sm">
                      {product.price_range.min > 0 ? formatPrice(product.price_range.min) : "-"}
                    </TD>
                    <TD align="center" label="موجودی" hideBelow="lg">
                      <span className={`text-sm ${product.total_stock === 0 ? "text-error" : "text-success"}`}>
                        {product.total_stock}
                      </span>
                    </TD>
                    <TD align="center" label="وضعیت">
                      <Badge variant={product.is_active ? "success" : "error"} size="sm">
                        {product.is_active ? "فعال" : "غیرفعال"}
                      </Badge>
                    </TD>
                    <TD align="center" label="عملیات">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => router.push(`/admin/products/${product.id}`)}
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
                    </TD>
                  </TRow>
                ))
              )}
            </TBody>
          </Table>

          {/* Pagination */}
          {data?.meta && (
            <Pagination meta={data.meta} onPageChange={setPage} itemLabel="محصول" className="mt-6" />
          )}
        </div>
      </main>
    </div>
  );
}
