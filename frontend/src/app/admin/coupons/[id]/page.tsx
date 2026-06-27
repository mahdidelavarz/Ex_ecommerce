// src/app/(admin)/admin/coupons/[id]/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { useAdminRoute } from "@/modules/auth/hooks/useAdminRoute";
import {
  useCreateCoupon,
  useUpdateCoupon,
} from "@/modules/coupons/hooks/useCoupons";
import { couponService } from "@/modules/coupons/services/coupon.service";
import { useCategories } from "@/modules/categories/hooks/useCategories";
import AdminFormLayout from "@/components/layout/AdminFormLayout";
import { Checkbox, FormSection, Input, Select, Toggle } from "@/components/ui";
import { useProducts } from "@/modules/products/hooks/useProducts";
import { numberField, nullableNumberField } from "@/lib/forms";
import {
  MdiTicketPercent,
  MdiCheckCircle,
  MdiPackageVariant,
  MdiShape,
} from "@/components/icons/Icons";

const typeOptions = [
  { value: "percentage", label: "درصدی" },
  { value: "fixed", label: "مبلغ ثابت" },
  { value: "free_shipping", label: "ارسال رایگان" },
];

const formSchema = z.object({
  code: z.string().min(1, "کد الزامی است").max(50),
  type: z.enum(["percentage", "fixed", "free_shipping"]),
  value: z.number({ error: "مقدار الزامی است" }).min(0),
  min_order_amount: z.number().min(0).nullable(),
  max_discount: z.number().min(0).nullable(),
  usage_limit: z.number().int().min(1).nullable(),
  usage_per_user: z.number().int().min(1).nullable(),
  starts_at: z.string().min(1, "تاریخ شروع الزامی است"),
  expires_at: z.string().min(1, "تاریخ انقضا الزامی است"),
  is_active: z.boolean(),
  product_ids: z.array(z.string()).optional(),
  category_ids: z.array(z.string()).optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function AdminCouponFormPage() {
  const router = useRouter();
  const params = useParams();
  const isEdit = params.id !== "new";
  const { isLoading: isAuthLoading } = useAdminRoute();
  const createCoupon = useCreateCoupon();
  const updateCoupon = useUpdateCoupon();
  const isSubmitting = createCoupon.isPending || updateCoupon.isPending;

  const { data: productsData } = useProducts({ limit: 200 });
  const { data: categoriesData } = useCategories({ limit: 100 });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
      type: "percentage",
      value: undefined,
      min_order_amount: null,
      max_discount: null,
      usage_limit: null,
      usage_per_user: null,
      starts_at: "",
      expires_at: "",
      is_active: true,
      product_ids: [],
      category_ids: [],
    },
  });

  const type = watch("type");
  const isActive = watch("is_active");
  const code = watch("code");
  const selectedProducts = watch("product_ids") || [];
  const selectedCategories = watch("category_ids") || [];

  useEffect(() => {
    if (isEdit) {
      couponService
        .getById(params.id as string)
        .then((c) => {
          reset({
            code: c.code,
            type: c.type,
            value: c.value,
            min_order_amount: c.min_order_amount,
            max_discount: c.max_discount,
            usage_limit: c.usage_limit,
            usage_per_user: c.usage_per_user,
            starts_at: c.starts_at?.split("T")[0],
            expires_at: c.expires_at?.split("T")[0],
            is_active: c.is_active,
            product_ids: c.products?.map((p) => p.id) || [],
            category_ids: c.categories?.map((cat) => cat.id) || [],
          });
        })
        .catch(() => {
          toast.error("خطا");
          router.back();
        });
    }
  }, [params.id]);

  const onSubmit = async (data: FormData) => {
    const payload = {
      ...data,
      min_order_amount: data.min_order_amount || null,
      max_discount: data.max_discount || null,
      usage_limit: data.usage_limit || null,
      usage_per_user: data.usage_per_user || null,
    };
    try {
      if (isEdit) {
        await updateCoupon.mutateAsync({
          id: params.id as string,
          data: payload,
        });
      } else {
        await createCoupon.mutateAsync(payload);
      }
      router.push("/admin/coupons");
    } catch {
      // toast handled by mutation hook
    }
  };

  const aside = (
    <FormSection title="وضعیت و زمان‌بندی" icon={MdiCheckCircle}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-text-secondary">فعال</span>
        <Toggle
          label={isActive ? "فعال" : "غیرفعال"}
          checked={isActive}
          onChange={(e) => setValue("is_active", e.target.checked)}
        />
      </div>
      <Input
        label="تاریخ شروع *"
        type="date"
        {...register("starts_at")}
        error={errors.starts_at?.message}
      />
      <Input
        label="تاریخ انقضا *"
        type="date"
        {...register("expires_at")}
        error={errors.expires_at?.message}
      />
    </FormSection>
  );

  return (
    <AdminFormLayout
      title={isEdit ? "ویرایش کد تخفیف" : "کد تخفیف جدید"}
      subtitle={isEdit ? code || undefined : "تعریف کد تخفیف جدید"}
      loading={isAuthLoading}
      onBack={() => router.back()}
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={isSubmitting}
      submitLabel={isEdit ? "بروزرسانی" : "ایجاد"}
      aside={aside}
    >
      {/* Coupon info */}
      <FormSection title="اطلاعات کد تخفیف" icon={MdiTicketPercent} columns={2}>
        <Input
          label="کد تخفیف *"
          className="uppercase"
          {...register("code")}
          error={errors.code?.message}
        />
        <Select label="نوع *" options={typeOptions} {...register("type")} />
        {type !== "free_shipping" && (
          <Input
            label={`${type === "percentage" ? "درصد" : "مبلغ (تومان)"} *`}
            type="number"
            {...register("value", numberField)}
            error={errors.value?.message}
          />
        )}
        <Input
          label="حداقل سفارش (تومان)"
          type="number"
          {...register("min_order_amount", nullableNumberField)}
          error={errors.min_order_amount?.message}
        />
        {type === "percentage" && (
          <Input
            label="حداکثر تخفیف (تومان)"
            type="number"
            {...register("max_discount", nullableNumberField)}
            error={errors.max_discount?.message}
          />
        )}
        <Input
          label="محدودیت تعداد"
          type="number"
          {...register("usage_limit", nullableNumberField)}
          error={errors.usage_limit?.message}
        />
        <Input
          label="محدودیت برای هر کاربر"
          type="number"
          {...register("usage_per_user", nullableNumberField)}
          error={errors.usage_per_user?.message}
        />
      </FormSection>

      <div className="flex gap-10">
        {/* Product Restrictions */}
        <FormSection
          title="محدودیت محصول"
          description="اگر انتخاب نشود، کد برای همه محصولات معتبر است."
          icon={MdiPackageVariant}
          className="w-1/2"
        >
          {selectedProducts.length > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-primary">
                {selectedProducts.length} محصول انتخاب شده
              </span>
              <button
                type="button"
                onClick={() => setValue("product_ids", [])}
                className="text-xs text-error hover:underline cursor-pointer"
              >
                حذف همه
              </button>
            </div>
          )}
          <div className="max-h-48 overflow-y-auto space-y-1 border border-border rounded-input p-2">
            {(productsData?.data ?? []).map((p: any) => (
              <Checkbox
                key={p.id}
                label={p.title}
                wrapperClassName="w-full px-2 py-1 rounded hover:bg-surface-raised"
                checked={selectedProducts.includes(p.id)}
                onChange={(e) => {
                  const next = e.target.checked
                    ? [...selectedProducts, p.id]
                    : selectedProducts.filter((id) => id !== p.id);
                  setValue("product_ids", next);
                }}
              />
            ))}
          </div>
        </FormSection>

        {/* Category Restrictions */}
        <FormSection
          title="محدودیت دسته‌بندی"
          description="اگر انتخاب نشود، کد برای همه دسته‌بندی‌ها معتبر است."
          icon={MdiShape}
          className="w-1/2"
        >
          {selectedCategories.length > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-primary">
                {selectedCategories.length} دسته‌بندی انتخاب شده
              </span>
              <button
                type="button"
                onClick={() => setValue("category_ids", [])}
                className="text-xs text-error hover:underline cursor-pointer"
              >
                حذف همه
              </button>
            </div>
          )}
          <div className="max-h-48 overflow-y-auto space-y-1 border border-border rounded-input p-2">
            {(categoriesData?.data ?? []).map((c: any) => (
              <Checkbox
                key={c.id}
                label={c.name}
                wrapperClassName="w-full px-2 py-1 rounded hover:bg-surface-raised"
                checked={selectedCategories.includes(c.id)}
                onChange={(e) => {
                  const next = e.target.checked
                    ? [...selectedCategories, c.id]
                    : selectedCategories.filter((id) => id !== c.id);
                  setValue("category_ids", next);
                }}
              />
            ))}
          </div>
        </FormSection>
      </div>
    </AdminFormLayout>
  );
}
