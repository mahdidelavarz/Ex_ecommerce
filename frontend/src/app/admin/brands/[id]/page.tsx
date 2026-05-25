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
import Button from "@/components/ui/Button";
import { MdiArrowRight, SvgSpinnersRingResize } from "@/components/icons/Icons";

const brandFormSchema = z.object({
  name: z.string().min(2, "نام برند الزامی است").max(100),
  logo: z.string().nullable(),
  description: z.string().nullable(),
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
    formState: { errors },
  } = useForm<BrandFormData>({
    resolver: zodResolver(brandFormSchema),
    defaultValues: {
      name: "",
      logo: null,
      description: null,
    },
  });

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
        logo: data.logo || undefined,
        description: data.description || undefined,
      };

      if (isEdit) {
        await brandService.update(params.id as string, payload);
        toast.success("برند با موفقیت بروزرسانی شد");
      } else {
        await brandService.create({ ...payload });
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
            <div className="bg-surface rounded-card shadow-card p-6 space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-text-secondary">
                  نام برند *
                </label>
                <input
                  type="text"
                  {...register("name")}
                  placeholder="مثال: سامسونگ"
                  className="w-full px-4 py-2 bg-surface border border-border rounded-input text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {errors.name && (
                  <p className="text-sm text-error">{errors.name.message}</p>
                )}
              </div>

              {/* Logo URL */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-text-secondary">
                  آدرس لوگو
                </label>
                <input
                  type="text"
                  {...register("logo")}
                  placeholder="https://..."
                  className="w-full px-4 py-2 bg-surface border border-border rounded-input text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-text-secondary">
                  توضیحات
                </label>
                <textarea
                  {...register("description")}
                  rows={4}
                  placeholder="توضیحات برند..."
                  className="w-full px-4 py-2 bg-surface border border-border rounded-input text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary resize-none"
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
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
