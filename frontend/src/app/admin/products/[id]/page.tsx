// src/app/(admin)/admin/products/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { useAdminRoute } from "@/modules/auth/hooks/useAdminRoute";
import { productService } from "@/modules/products/services/product.service";
import { useCategories } from "@/modules/categories/hooks/useCategories";
import { useAllBrands } from "@/modules/brands/hooks/useBrands";
import AdminSidebar from "@/components/layout/AdminSidebar";
import Button from "@/components/ui/Button";
import { MdiArrowRight, SvgSpinnersRingResize } from "@/components/icons/Icons";

const productFormSchema = z.object({
  category_id: z.string().min(1, "دسته‌بندی الزامی است"),
  brand_id: z.string().nullable(),
  title: z.string().min(2, "عنوان الزامی است").max(200),
  short_description: z.string().nullable(),
  full_description: z.string().nullable(),
  seo_title: z.string().nullable(),
  seo_description: z.string().nullable(),
  is_active: z.boolean(),
  is_public: z.boolean(),
});

type ProductFormData = z.infer<typeof productFormSchema>;

export default function AdminProductFormPage() {
  const router = useRouter();
  const params = useParams();
  const isEdit = params.id !== "new";
  const { isLoading: isAuthLoading } = useAdminRoute();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: categoriesData } = useCategories({ limit: 200 });
  console.log(categoriesData);
  const { data: brandsData } = useAllBrands();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      category_id: "",
      brand_id: null,
      title: "",
      short_description: null,
      full_description: null,
      seo_title: null,
      seo_description: null,
      is_active: false,
      is_public: false,
    },
  });

  const isActive = watch("is_active");
  const isPublic = watch("is_public");

  useEffect(() => {
    if (isEdit) loadProduct(params.id as string);
  }, [params.id]);

  const loadProduct = async (id: string) => {
    try {
      const product = await productService.getBySlug(id);
      reset({
        category_id: product.category?.id || "",
        brand_id: product.brand?.id || null,
        title: product.title,
        short_description: product.short_description,
        full_description: product.full_description,
        seo_title: product.seo?.title,
        seo_description: product.seo?.description,
        is_active: true, // from entity
        is_public: true, // from entity
      });
    } catch (error) {
      toast.error("خطا در دریافت اطلاعات محصول");
      router.push("/admin/products");
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        brand_id: data.brand_id || null,
        short_description: data.short_description || null,
        full_description: data.full_description || null,
        seo_title: data.seo_title || null,
        seo_description: data.seo_description || null,
      };

      if (isEdit) {
        await productService.update(params.id as string, payload);
        toast.success("محصول با موفقیت بروزرسانی شد");
      } else {
        await productService.create(payload);
        toast.success("محصول با موفقیت ایجاد شد");
      }
      router.push("/admin/products");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "خطا در ذخیره محصول");
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
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-surface-raised rounded-button"
            >
              <MdiArrowRight className="w-5 h-5 text-text-secondary" />
            </button>
            <h1 className="text-2xl font-bold text-text-primary">
              {isEdit ? "ویرایش محصول" : "محصول جدید"}
            </h1>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="bg-surface rounded-card shadow-card p-6">
                <h2 className="text-lg font-bold text-text-primary mb-6">
                  اطلاعات پایه
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-text-secondary">
                      عنوان *
                    </label>
                    <input
                      {...register("title")}
                      className="w-full px-4 py-2 bg-surface border border-border rounded-input focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    {errors.title && (
                      <p className="text-sm text-error">
                        {errors.title.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-text-secondary">
                      دسته‌بندی *
                    </label>
                    <select
                      {...register("category_id")}
                      className="w-full px-4 py-2 bg-surface border border-border rounded-input focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">انتخاب کنید</option>
                      {categoriesData?.data?.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    {errors.category_id && (
                      <p className="text-sm text-error">
                        {errors.category_id.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-text-secondary">
                      برند
                    </label>
                    <select
                      {...register("brand_id")}
                      className="w-full px-4 py-2 bg-surface border border-border rounded-input focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">بدون برند</option>
                      {brandsData?.map((brand) => (
                        <option key={brand.id} value={brand.id}>
                          {brand.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-text-secondary">
                      توضیح کوتاه
                    </label>
                    <input
                      {...register("short_description")}
                      className="w-full px-4 py-2 bg-surface border border-border rounded-input focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="bg-surface rounded-card shadow-card p-6">
                <h2 className="text-lg font-bold text-text-primary mb-6">
                  وضعیت
                </h2>
                <div className="flex gap-8">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setValue("is_active", e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-border rounded-full peer-checked:bg-success after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all relative" />
                    <span className="text-sm text-text-secondary">
                      {isActive ? "فعال" : "غیرفعال"}
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPublic}
                      onChange={(e) => setValue("is_public", e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-border rounded-full peer-checked:bg-success relative after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" />
                    <span className="text-sm text-text-secondary">
                      {isPublic ? "منتشر شده" : "پیش‌نویس"}
                    </span>
                  </label>
                </div>
              </div>

              {/* SEO */}
              <div className="bg-surface rounded-card shadow-card p-6">
                <h2 className="text-lg font-bold text-text-primary mb-6">
                  سئو
                </h2>
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-text-secondary">
                      عنوان سئو
                    </label>
                    <input
                      {...register("seo_title")}
                      className="w-full px-4 py-2 bg-surface border border-border rounded-input focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-text-secondary">
                      توضیحات سئو
                    </label>
                    <textarea
                      {...register("seo_description")}
                      rows={3}
                      className="w-full px-4 py-2 bg-surface border border-border rounded-input focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <Button type="submit" loading={isSubmitting} size="lg">
                  {isEdit ? "بروزرسانی" : "ایجاد محصول"}
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
