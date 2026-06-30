// src/app/(admin)/admin/products/page.tsx
"use client";

import { Fragment, useState } from "react";
import { useRouter } from "next/navigation";
import {
  useProducts,
  useDeleteProduct,
  useBulkProductStatus,
} from "@/modules/products/hooks/useProducts";
import { useCategories } from "@/modules/categories/hooks/useCategories";
import { useAllBrands } from "@/modules/brands/hooks/useBrands";
import { useAdminRoute } from "@/modules/auth/hooks/useAdminRoute";
import AdminPage from "@/components/layout/AdminPage";
import {
  Badge,
  Button,
  Checkbox,
  Input,
  PageFilters,
  PageHeader,
  Pagination,
  RowActions,
  Select,
  Table,
  TBody,
  TD,
  TableEmpty,
  TableSkeleton,
  TH,
  THead,
  TRow,
  useTableSelection,
} from "@/components/ui";
import { formatPrice } from "@/utils/formatPrice";
import ProductVariantBreakdown from "@/modules/products/components/ProductVariantBreakdown";
import type { ProductListResponse } from "@/modules/products/types/product.types";
import {
  LucidePencil,
  LucidePlus,
  LucideSearch,
  MdiChevronDown,
  MdiChevronUp,
  MdiImageOff,
  MdiPackageVariantClosed,
  MdiTrashCan,
} from "@/components/icons/Icons";

export default function AdminProductsPage() {
  const router = useRouter();
  const { isLoading: isAuthLoading } = useAdminRoute();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [brandFilter, setBrandFilter] = useState("");

  const { data: categoriesData } = useCategories({ limit: 100 });
  const { data: brandsData } = useAllBrands();

  const { data, isLoading } = useProducts({
    page,
    limit: 8,
    search: search || undefined,
    category_id: categoryFilter || undefined,
    brand_id: brandFilter || undefined,
    is_public: undefined, // Show all in admin
  });
  const deleteProduct = useDeleteProduct();
  const bulkProductStatus = useBulkProductStatus();

  const selection = useTableSelection(data?.data, (p) => p.id);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDelete = (product: ProductListResponse) => {
    if (!window.confirm(`آیا از حذف "${product.title}" اطمینان دارید؟`)) return;
    // success/error toasts are handled by the useDeleteProduct hook
    deleteProduct.mutate(product.id);
  };

  const handleBulkStatus = (is_active: boolean) => {
    if (selection.count === 0) return;
    bulkProductStatus.mutate(
      { ids: Array.from(selection.selectedIds), is_active },
      { onSuccess: () => selection.clear() },
    );
  };

  return (
    <AdminPage
      maxWidth="7xl"
      loading={isAuthLoading}
      header={
        <PageHeader
          title="محصولات"
          subtitle="مدیریت محصولات فروشگاه"
          action={{
            label: "محصول جدید",
            icon: LucidePlus,
            onClick: () => router.push("/admin/products/new"),
          }}
        />
      }
      filters={
        <>
          <PageFilters>
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
          </PageFilters>

          {/* Bulk Actions */}
          {selection.count > 0 && (
            <div className="shrink-0 bg-primary-light rounded-card p-3 mb-4 flex items-center gap-3">
              <span className="text-sm text-primary font-medium">
                {selection.count} محصول انتخاب شده
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
        </>
      }
      footer={
        data?.meta && (
          <Pagination
            meta={data.meta}
            onPageChange={setPage}
            itemLabel="محصول"
          />
        )
      }
    >
      {/* Table */}
      <Table>
            <THead>
              <TH className="w-10">
                <Checkbox
                  checked={selection.allSelected}
                  onChange={(e) => selection.toggleAll(e.target.checked)}
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
                  <Fragment key={product.id}>
                  <TRow hover>
                    <TD cardSlot="select">
                      <Checkbox
                        checked={selection.isSelected(product)}
                        onChange={() => selection.toggle(product)}
                      />
                    </TD>
                    <TD align="right" cardSlot="header">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => toggleExpanded(product.id)}
                          title={expanded.has(product.id) ? "بستن واریانت‌ها" : "نمایش واریانت‌ها"}
                          aria-label="نمایش واریانت‌ها"
                          className="p-1 rounded-button hover:bg-surface-raised text-text-muted cursor-pointer shrink-0"
                        >
                          {expanded.has(product.id) ? (
                            <MdiChevronUp className="w-5 h-5" />
                          ) : (
                            <MdiChevronDown className="w-5 h-5" />
                          )}
                        </button>
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
                    <TD align="center" cardSlot="badge">
                      <Badge variant={product.is_active ? "success" : "error"} size="sm">
                        {product.is_active ? "فعال" : "غیرفعال"}
                      </Badge>
                    </TD>
                    <TD align="center" cardSlot="actions">
                      <RowActions
                        actions={[
                          {
                            icon: LucidePencil,
                            title: "ویرایش",
                            onClick: () =>
                              router.push(`/admin/products/${product.id}`),
                          },
                          {
                            icon: MdiTrashCan,
                            title: "حذف",
                            variant: "error",
                            onClick: () => handleDelete(product),
                          },
                        ]}
                      />
                    </TD>
                  </TRow>
                  {expanded.has(product.id) && (
                    <TRow>
                      <TD colSpan={6} className="bg-surface-raised/40">
                        <ProductVariantBreakdown productId={product.id} />
                      </TD>
                    </TRow>
                  )}
                  </Fragment>
                ))
              )}
            </TBody>
          </Table>
    </AdminPage>
  );
}
