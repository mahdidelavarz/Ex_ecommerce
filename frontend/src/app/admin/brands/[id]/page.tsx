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
import AdminSidebar from "@/components/layout/AdminSidebar";
import { Button, Card, Input, Textarea, Toggle } from "@/components/ui";
import { MdiArrowRight, SvgSpinnersRingResize } from "@/components/icons/Icons";

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
        await brandService.update(params.id as string, payload);
        toast.success("برند با موفقیت بروزرسانی شد");
      } else {
        await brandService.create(payload);
        toast.success("برند با موفقیت ایجاد شد");
      }
      router.push("/admin/brands");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "خطا در ذخیره برند");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <SvgSpinnersRingResize className="text-primary" width={48} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />

      <main className="flex-1 lg:mr-64 p-4 lg:p-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-surface-raised rounded-button transition-colors"
            >
              <MdiArrowRight className="w-5 h-5 text-text-secondary" />
            </button>
            <h1 className="text-2xl font-bold text-text-primary">
              {isEdit ? "ویرایش برند" : "برند جدید"}
            </h1>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Card className="p-6 space-y-6">
              {/* Name */}
              <Input
                label="نام برند *"
                type="text"
                {...register("name")}
                placeholder="مثال: سامسونگ"
                error={errors.name?.message}
              />

              {/* Logo URL */}
              <div className="space-y-2">
                <Input
                  label="آدرس لوگو"
                  type="text"
                  dir="ltr"
                  {...register("logo")}
                  placeholder="https://..."
                  error={errors.logo?.message}
                />
                {logoUrl && urlPattern.test(logoUrl) && (
                  <img
                    src={logoUrl}
                    alt="پیش‌نمایش لوگو"
                    className="h-16 object-contain border border-border rounded-lg p-1 bg-white"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                )}
              </div>

              {/* Description */}
              <Textarea
                label="توضیحات"
                {...register("description")}
                rows={4}
                placeholder="توضیحات برند..."
              />

              {/* Active toggle */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-text-secondary">وضعیت</label>
                <Toggle
                  label={isActive ? "فعال" : "غیرفعال"}
                  checked={isActive}
                  onChange={(e) => setValue("is_active", e.target.checked)}
                />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4 pt-4">
                <Button type="submit" loading={isSubmitting} size="lg">
                  {isEdit ? "بروزرسانی" : "ایجاد برند"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                >
                  انصراف
                </Button>
              </div>
            </Card>
          </form>
        </div>
      </main>
    </div>
  );
}
