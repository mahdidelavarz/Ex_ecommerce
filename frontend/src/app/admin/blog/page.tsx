// src/app/admin/blog/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAdminBlogPosts } from "@/modules/blog/hooks/useBlog";
import { blogService } from "@/modules/blog/services/blog.service";
import { useAdminRoute } from "@/modules/auth/hooks/useAdminRoute";
import { formatDate } from "@/utils/formatDate";
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
import type { BlogPostListItem } from "@/modules/blog/types/blog.types";
import {
  LucidePencil,
  LucidePlus,
  LucideSearch,
  MdiCheckCircle,
  MdiCloseCircle,
  MdiImageOff,
  MdiNewspaperVariantOutline,
  MdiTrashCan,
} from "@/components/icons/Icons";

export default function AdminBlogPage() {
  const router = useRouter();
  const { isLoading: isAuthLoading } = useAdminRoute();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const { data, isLoading, refetch } = useAdminBlogPosts({
    page,
    limit: 20,
    search: search || undefined,
    is_published:
      statusFilter === "" ? undefined : statusFilter === "published",
    sort_by: "created_at",
    sort_order: "DESC",
  });

  const handleDelete = async (post: BlogPostListItem) => {
    if (!window.confirm("آیا از حذف این مطلب اطمینان دارید؟")) return;
    try {
      await blogService.remove(post.id);
      toast.success("مطلب با موفقیت حذف شد");
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "خطا در حذف مطلب");
    }
  };

  return (
    <AdminPage
      maxWidth="7xl"
      loading={isAuthLoading}
      header={
        <PageHeader
          title="وبلاگ"
          subtitle="مدیریت مطالب وبلاگ"
          action={{
            label: "مطلب جدید",
            icon: LucidePlus,
            onClick: () => router.push("/admin/blog/new"),
          }}
        />
      }
      filters={
        <PageFilters>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Input
              wrapperClassName="flex-1"
              type="text"
              placeholder="جستجو در مطالب..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              icon={LucideSearch}
            />
            <Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">همه وضعیت‌ها</option>
              <option value="published">منتشر شده</option>
              <option value="draft">پیش‌نویس</option>
            </Select>
          </div>
        </PageFilters>
      }
      footer={
        data?.meta && (
          <Pagination meta={data.meta} onPageChange={setPage} itemLabel="مطلب" />
        )
      }
    >
      <Table>
        <THead>
          <TH align="right">عنوان</TH>
          <TH align="center" hideBelow="md">
            برچسب‌ها
          </TH>
          <TH align="center" hideBelow="md">
            بازدید
          </TH>
          <TH align="center" hideBelow="md">
            تاریخ
          </TH>
          <TH align="center">وضعیت</TH>
          <TH align="center">عملیات</TH>
        </THead>
        <TBody>
          {isLoading ? (
            <TableSkeleton rows={5} columns={6} />
          ) : data?.data?.length === 0 ? (
            <TableEmpty
              colSpan={6}
              message="مطلبی یافت نشد"
              icon={MdiNewspaperVariantOutline}
            />
          ) : (
            data?.data?.map((post) => (
              <TRow key={post.id} hover>
                <TD align="right" cardSlot="header">
                  <div className="flex items-center gap-3">
                    {post.cover_image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={post.cover_image}
                        alt={post.title}
                        className="h-10 w-14 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-14 items-center justify-center rounded-lg bg-surface-raised">
                        <MdiImageOff className="h-5 w-5 text-text-muted" />
                      </div>
                    )}
                    <p className="line-clamp-1 font-medium text-text-primary">
                      {post.title}
                    </p>
                  </div>
                </TD>
                <TD align="center" label="برچسب‌ها" hideBelow="md">
                  <span className="text-xs text-text-secondary">
                    {post.tags.length > 0 ? post.tags.join("، ") : "—"}
                  </span>
                </TD>
                <TD
                  align="center"
                  label="بازدید"
                  hideBelow="md"
                  className="text-text-secondary"
                >
                  {post.view_count.toLocaleString("fa-IR")}
                </TD>
                <TD
                  align="center"
                  label="تاریخ"
                  hideBelow="md"
                  className="text-text-secondary"
                >
                  {formatDate(post.published_at ?? post.created_at)}
                </TD>
                <TD align="center" cardSlot="badge">
                  <Badge
                    variant={post.is_published ? "success" : "error"}
                    size="sm"
                    icon={post.is_published ? MdiCheckCircle : MdiCloseCircle}
                  >
                    {post.is_published ? "منتشر شده" : "پیش‌نویس"}
                  </Badge>
                </TD>
                <TD align="center" cardSlot="actions">
                  <RowActions
                    actions={[
                      {
                        icon: LucidePencil,
                        title: "ویرایش",
                        onClick: () => router.push(`/admin/blog/${post.id}`),
                      },
                      {
                        icon: MdiTrashCan,
                        title: "حذف",
                        variant: "error",
                        onClick: () => handleDelete(post),
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
