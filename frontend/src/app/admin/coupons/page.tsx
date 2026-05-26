// src/app/(admin)/admin/coupons/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useCoupons } from "@/modules/coupons/hooks/useCoupons";
import { couponService } from "@/modules/coupons/services/coupon.service";
import { useAdminRoute } from "@/modules/auth/hooks/useAdminRoute";
import AdminSidebar from "@/components/layout/AdminSidebar";
import Button from "@/components/ui/Button";
import type { Coupon } from "@/modules/coupons/types/coupon.types";
import {
  LucidePencil,
  LucidePlus,
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

  const { data, isLoading, refetch } = useCoupons({ page, limit: 20 });

  const handleDelete = async (coupon: Coupon) => {
    if (!window.confirm(`حذف کد "${coupon.code}"؟`)) return;
    try {
      await couponService.delete(coupon.id);
      toast.success("کد تخفیف حذف شد");
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "خطا");
    }
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

          <div className="bg-surface rounded-card shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-surface-raised">
                    <th className="text-right px-4 py-3 text-sm">کد</th>
                    <th className="text-center px-4 py-3 text-sm">نوع</th>
                    <th className="text-center px-4 py-3 text-sm">مقدار</th>
                    <th className="text-center px-4 py-3 text-sm hidden md:table-cell">
                      مصرف
                    </th>
                    <th className="text-center px-4 py-3 text-sm hidden lg:table-cell">
                      اعتبار
                    </th>
                    <th className="text-center px-4 py-3 text-sm">وضعیت</th>
                    <th className="text-center px-4 py-3 text-sm">عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    [...Array(3)].map((_, i) => (
                      <tr key={i} className="border-b border-border">
                        <td colSpan={7} className="px-4 py-4">
                          <div className="h-4 bg-surface-raised rounded animate-pulse-soft" />
                        </td>
                      </tr>
                    ))
                  ) : data?.data?.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="text-center py-12 text-text-secondary"
                      >
                        کد تخفیفی یافت نشد
                      </td>
                    </tr>
                  ) : (
                    data?.data?.map((coupon) => (
                      <tr
                        key={coupon.id}
                        className="border-b border-border hover:bg-surface-raised/50"
                      >
                        <td className="px-4 py-3">
                          <code className="bg-primary-light text-primary px-3 py-1 rounded text-sm font-bold">
                            {coupon.code}
                          </code>
                        </td>
                        <td className="px-4 py-3 text-center text-sm">
                          {typeLabels[coupon.type]}
                        </td>
                        <td className="px-4 py-3 text-center text-sm font-medium">
                          {coupon.type === "free_shipping"
                            ? "رایگان"
                            : coupon.type === "percentage"
                              ? `${coupon.value}٪`
                              : `${coupon.value.toLocaleString()} تومان`}
                        </td>
                        <td className="px-4 py-3 text-center text-sm hidden md:table-cell">
                          {coupon.used_count}
                          {coupon.usage_limit ? ` / ${coupon.usage_limit}` : ""}
                        </td>
                        <td className="px-4 py-3 text-center text-xs hidden lg:table-cell">
                          <div>
                            {new Date(coupon.starts_at).toLocaleDateString(
                              "fa-IR",
                            )}
                          </div>
                          <div className="text-text-muted">
                            تا{" "}
                            {new Date(coupon.expires_at).toLocaleDateString(
                              "fa-IR",
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                              coupon.is_active
                                ? "bg-success-light text-success"
                                : "bg-error-light text-error"
                            }`}
                          >
                            {coupon.is_active ? "فعال" : "غیرفعال"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-center gap-1">
                            <button
                              onClick={() =>
                                router.push(`/admin/coupons/${coupon.id}`)
                              }
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
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
