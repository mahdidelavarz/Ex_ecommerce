// src/app/(admin)/admin/coupons/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCoupons, useDeleteCoupon } from "@/modules/coupons/hooks/useCoupons";
import { useAdminRoute } from "@/modules/auth/hooks/useAdminRoute";
import AdminSidebar from "@/components/layout/AdminSidebar";
import {
  Badge,
  Button,
  Pagination,
  Table,
  TBody,
  TD,
  TableEmpty,
  TableSkeleton,
  TH,
  THead,
  TRow,
} from "@/components/ui";
import type { Coupon } from "@/modules/coupons/types/coupon.types";
import {
  LucidePencil,
  LucidePlus,
  MdiTagOff,
  MdiTrashCan,
  SvgSpinnersRingResize,
} from "@/components/icons/Icons";

const typeLabels: Record<string, string> = {
  percentage: "درصدی",
  fixed: "مبلغ ثابت",
  free_shipping: "ارسال رایگان",
};

export default function AdminCouponsPage() {
  const router = useRouter();
  const { isLoading: isAuthLoading } = useAdminRoute();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useCoupons({ page, limit: 20 });
  const deleteCoupon = useDeleteCoupon();

  const handleDelete = async (coupon: Coupon) => {
    if (!window.confirm(`حذف کد "${coupon.code}"؟`)) return;
    deleteCoupon.mutate(coupon.id);
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
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-text-primary">
                کدهای تخفیف
              </h1>
              <p className="text-text-secondary text-sm mt-1">
                مدیریت کوپن‌های تخفیف
              </p>
            </div>
            <Button
              onClick={() => router.push("/admin/coupons/new")}
              icon={LucidePlus}
            >
              کد تخفیف جدید
            </Button>
          </div>

          <Table>
            <THead>
              <TH align="right">کد</TH>
              <TH align="center">نوع</TH>
              <TH align="center">مقدار</TH>
              <TH align="center" hideBelow="lg">حداقل سفارش</TH>
              <TH align="center" hideBelow="lg">حداکثر تخفیف</TH>
              <TH align="center" hideBelow="lg">هر کاربر</TH>
              <TH align="center" hideBelow="md">مصرف</TH>
              <TH align="center" hideBelow="lg">اعتبار</TH>
              <TH align="center">وضعیت</TH>
              <TH align="center">عملیات</TH>
            </THead>
            <TBody>
              {isLoading ? (
                <TableSkeleton rows={3} columns={10} />
              ) : data?.data?.length === 0 ? (
                <TableEmpty colSpan={10} message="کد تخفیفی یافت نشد" icon={MdiTagOff} />
              ) : (
                data?.data?.map((coupon) => (
                  <TRow key={coupon.id} hover>
                    <TD align="right" label="کد">
                      <code className="bg-primary-light text-primary px-3 py-1 rounded text-sm font-bold">
                        {coupon.code}
                      </code>
                    </TD>
                    <TD align="center" label="نوع">{typeLabels[coupon.type]}</TD>
                    <TD align="center" label="مقدار" className="font-medium">
                      {coupon.type === "free_shipping"
                        ? "رایگان"
                        : coupon.type === "percentage"
                          ? `${coupon.value}٪`
                          : `${coupon.value.toLocaleString()} تومان`}
                    </TD>
                    <TD align="center" label="حداقل سفارش" hideBelow="lg">
                      {coupon.min_order_amount ? `${coupon.min_order_amount.toLocaleString()} تومان` : '—'}
                    </TD>
                    <TD align="center" label="حداکثر تخفیف" hideBelow="lg">
                      {coupon.max_discount ? `${coupon.max_discount.toLocaleString()} تومان` : '—'}
                    </TD>
                    <TD align="center" label="هر کاربر" hideBelow="lg">{coupon.usage_per_user ?? '—'}</TD>
                    <TD align="center" label="مصرف" hideBelow="md">
                      {coupon.used_count}
                      {coupon.usage_limit ? ` / ${coupon.usage_limit}` : ""}
                    </TD>
                    <TD align="center" label="اعتبار" hideBelow="lg" className="text-xs">
                      <span className="flex flex-col md:block">
                        <span>{new Date(coupon.starts_at).toLocaleDateString("fa-IR")}</span>
                        <span className="text-text-muted">تا {new Date(coupon.expires_at).toLocaleDateString("fa-IR")}</span>
                      </span>
                    </TD>
                    <TD align="center" label="وضعیت">
                      <Badge variant={coupon.is_active ? "success" : "neutral"} size="sm">
                        {coupon.is_active ? "فعال" : "غیرفعال"}
                      </Badge>
                    </TD>
                    <TD align="center" label="عملیات">
                      <div className="flex justify-center gap-1">
                        <button
                          onClick={() => router.push(`/admin/coupons/${coupon.id}`)}
                          className="p-2 hover:bg-primary-light rounded-button text-primary"
                        >
                          <LucidePencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(coupon)}
                          className="p-2 hover:bg-error-light rounded-button text-error"
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

          {data?.meta && (
            <Pagination meta={data.meta} onPageChange={setPage} itemLabel="کد تخفیف" className="mt-6" />
          )}
        </div>
      </main>
    </div>
  );
}
