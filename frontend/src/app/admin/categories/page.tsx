// src/app/(admin)/admin/categories/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  useAdminCategories,
  useDeleteCategory,
} from "@/modules/categories/hooks/useCategories";
import { useAdminRoute } from "@/modules/auth/hooks/useAdminRoute";
import AdminPage from "@/components/layout/AdminPage";
import {
  Badge,
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
} from "@/components/ui";
import type { Category } from "@/modules/categories/types/category.types";
import { getImageSrc } from "@/utils/imageUrl";
import {
  LucidePencil,
  LucidePlus,
  LucideSearch,
  MdiCheckCircle,
  MdiCloseCircle,
  MdiFolderOpenOutline,
  MdiTrashCan,
  SolarFolderWithFilesBold,
} from "@/components/icons/Icons";

function CategoryThumbnail({ category }: { category: Category }) {
  const imageSrc = getImageSrc(category.image);

  if (imageSrc) {
    return (
      <img
        src={imageSrc}
        alt={category.name}
        className="w-10 h-10 rounded-lg object-cover"
      />
    );
  }

  return (
    <div
      className="w-10 h-10 rounded-lg flex items-center justify-center"
      style={{
        backgroundColor: category.color || "var(--color-primary-light)",
      }}
    >
      <SolarFolderWithFilesBold className="w-5 h-5 text-white" />
    </div>
  );
}

export default function AdminCategoriesPage() {
  const router = useRouter();
  const { isLoading: isAuthLoading } = useAdminRoute();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [parentFilter, setParentFilter] = useState<string | null>(null);

  const { data, isLoading } = useAdminCategories({
    page,
    limit: 20,
    search: search || undefined,
    parent_id: parentFilter,
  });
  const deleteCategory = useDeleteCategory();

  const handleDelete = async (category: Category) => {
    if (category.products_count > 0) {
      toast.error(`این دسته‌بندی ${category.products_count} محصول دارد و نمی‌توان آن را حذف کرد`);
      return;
    }

    const confirmMessage =
      category.children_count > 0
        ? `این دسته‌بندی ${category.children_count} زیرمجموعه دارد. با حذف اجباری، زیرمجموعه‌ها نیز حذف می‌شوند. ادامه می‌دهید؟`
        : "آیا از حذف این دسته‌بندی اطمینان دارید؟";

    if (!window.confirm(confirmMessage)) return;

    // success/error toasts are handled by the useDeleteCategory hook
    deleteCategory.mutate({ id: category.id, force: category.children_count > 0 });
  };

  return (
    <AdminPage
      maxWidth="7xl"
      loading={isAuthLoading}
      header={
        <PageHeader
          title="دسته‌بندی‌ها"
          subtitle="مدیریت دسته‌بندی‌های فروشگاه"
          action={{
            label: "دسته‌بندی جدید",
            icon: LucidePlus,
            onClick: () => router.push("/admin/categories/new"),
          }}
        />
      }
      filters={
        <PageFilters>
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              wrapperClassName="flex-1"
              type="text"
              placeholder="جستجو در دسته‌بندی‌ها..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              icon={LucideSearch}
            />
            <Select
              value={parentFilter || ""}
              onChange={(e) => {
                setParentFilter(e.target.value || null);
                setPage(1);
              }}
            >
              <option value="">همه دسته‌بندی‌ها</option>
              <option value="null">دسته‌های اصلی</option>
              {data?.data?.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </Select>
          </div>
        </PageFilters>
      }
      footer={
        data?.meta && (
          <Pagination
            meta={data.meta}
            onPageChange={setPage}
            itemLabel="دسته‌بندی"
          />
        )
      }
    >
      {/* Table */}
      <Table>
            <THead>
              <TH align="right">نام</TH>
              <TH align="center" hideBelow="md">اسلاگ</TH>
              <TH align="center" hideBelow="md">زیرمجموعه</TH>
              <TH align="center" hideBelow="md">محصولات</TH>
              <TH align="center">وضعیت</TH>
              <TH align="center">عملیات</TH>
            </THead>
            <TBody>
              {isLoading ? (
                <TableSkeleton rows={5} columns={6} />
              ) : data?.data?.length === 0 ? (
                <TableEmpty colSpan={6} message="دسته‌بندی یافت نشد" icon={MdiFolderOpenOutline} />
              ) : (
                data?.data?.map((category) => (
                  <TRow key={category.id} hover>
                    <TD align="right" cardSlot="header">
                      <div className="flex items-center gap-3">
                        <CategoryThumbnail category={category} />
                        <div>
                          <p className="font-medium text-text-primary">{category.name}</p>
                          <p className="text-xs text-text-muted">ترتیب: {category.sort_order}</p>
                        </div>
                      </div>
                    </TD>
                    <TD align="right" label="اسلاگ" hideBelow="md">
                      <code className="text-xs bg-surface-raised px-2 py-1 rounded text-text-secondary">
                        {category.slug}
                      </code>
                    </TD>
                    <TD align="center" label="زیرمجموعه" hideBelow="sm" className="text-text-secondary">
                      {category.children_count}
                    </TD>
                    <TD align="center" label="محصولات" hideBelow="sm" className="text-text-secondary">
                      {category.products_count}
                    </TD>
                    <TD align="center" cardSlot="badge">
                      <Badge
                        variant={category.is_active ? "success" : "error"}
                        size="sm"
                        icon={category.is_active ? MdiCheckCircle : MdiCloseCircle}
                      >
                        {category.is_active ? "فعال" : "غیرفعال"}
                      </Badge>
                    </TD>
                    <TD align="center" cardSlot="actions">
                      <RowActions
                        actions={[
                          {
                            icon: LucidePencil,
                            title: "ویرایش",
                            onClick: () =>
                              router.push(`/admin/categories/${category.id}`),
                          },
                          {
                            icon: MdiTrashCan,
                            title: "حذف",
                            variant: "error",
                            onClick: () => handleDelete(category),
                          },
                        ]}
                      />
                    </TD>
                  </TRow>
                ))
              )}
            </TBody>
          </Table>
    </AdminPage>
  );
}
