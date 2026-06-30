// src/app/(admin)/admin/brands/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { useAdminRoute } from "@/modules/auth/hooks/useAdminRoute";
import { brandService } from "@/modules/brands/services/brand.service";
import { useCreateBrand, useUpdateBrand } from "@/modules/brands/hooks/useBrands";
import AdminFormLayout from "@/components/layout/AdminFormLayout";
import { FormSection, Input, Textarea, Toggle } from "@/components/ui";
import { MdiInformation, MdiCheckCircle, MdiImageMultiple } from "@/components/icons/Icons";

const urlPattern = /^https?:\/\/.+/;

const brandFormSchema = z.object({
  name: z.string().min(2, "نام برند الزامی است").max(100),
  logo: z
    .string()
    .refine((val) => !val || urlPattern.test(val), "آدرس لوگو نامعتبر است")
    .nullable(),
  description: z.string().nullable(),
  is_active: z.boolean(),
});

type BrandFormData = z.infer<typeof brandFormSchema>;

export default function AdminBrandFormPage() {
  const router = useRouter();
  const params = useParams();
  const { isLoading: isAuthLoading } = useAdminRoute();
  const isEdit = params.id !== "new";
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createBrand = useCreateBrand();
  const updateBrand = useUpdateBrand();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BrandFormData>({
    resolver: zodResolver(brandFormSchema),
    defaultValues: {
      name: "",
      logo: null,
      description: null,
      is_active: true,
    },
  });

  const logoUrl = watch("logo");
  const isActive = watch("is_active");
  const watchedName = watch("name");

  useEffect(() => {
    if (isEdit) {
      loadBrand(params.id as string);
    }
  }, [params.id]);

  const loadBrand = async (id: string) => {
    try {
      const brand = await brandService.getBySlug(id);
      reset({
        name: brand.name,
        logo: brand.logo || null,
        description: brand.description || null,
        is_active: brand.is_active,
      });
    } catch (error) {
      toast.error("خطا در دریافت اطلاعات برند");
      router.push("/admin/brands");
    }
  };

  const onSubmit = async (data: BrandFormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        name: data.name,
        logo: data.logo || null,
        description: data.description || null,
        is_active: data.is_active,
      };

      if (isEdit) {
        await updateBrand.mutateAsync({ id: params.id as string, data: payload });
      } else {
        await createBrand.mutateAsync(payload);
      }
      router.push("/admin/brands");
    } catch {
      // error toast handled by the mutation hook's onError
    } finally {
      setIsSubmitting(false);
    }
  };

  const aside = (
    <>
      {/* Status */}
      <FormSection title="وضعیت" icon={MdiCheckCircle}>
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-text-secondary">نمایش در فروشگاه</span>
          <Toggle
            label={isActive ? "فعال" : "غیرفعال"}
            checked={isActive}
            onChange={(e) => setValue("is_active", e.target.checked)}
          />
        </div>
      </FormSection>

      {/* Logo */}
      <FormSection title="لوگو" description="آدرس تصویر لوگوی برند" icon={MdiImageMultiple}>
        <Input
          label="آدرس لوگو"
          type="text"
          dir="ltr"
          {...register("logo")}
          placeholder="https://..."
          error={errors.logo?.message}
        />
        {logoUrl && urlPattern.test(logoUrl) && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl}
            alt="پیش‌نمایش لوگو"
            className="h-16 object-contain border border-border rounded-lg p-1 bg-white"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        )}
      </FormSection>
    </>
  );

  return (
    <AdminFormLayout
      title={isEdit ? "ویرایش برند" : "برند جدید"}
      subtitle={isEdit ? watchedName || undefined : "افزودن برند جدید به فروشگاه"}
      loading={isAuthLoading}
      onBack={() => router.back()}
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={isSubmitting}
      submitLabel={isEdit ? "بروزرسانی" : "ایجاد برند"}
      aside={aside}
    >
      {/* Basic info */}
      <FormSection title="اطلاعات پایه" icon={MdiInformation}>
        <Input
          label="نام برند *"
          type="text"
          {...register("name")}
          placeholder="مثال: سامسونگ"
          error={errors.name?.message}
        />
        <Textarea
          label="توضیحات"
          {...register("description")}
          rows={4}
          placeholder="توضیحات برند..."
        />
      </FormSection>
    </AdminFormLayout>
  );
}
