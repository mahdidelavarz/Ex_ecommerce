// src/app/admin/blog/[id]/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { useAdminRoute } from "@/modules/auth/hooks/useAdminRoute";
import { blogService } from "@/modules/blog/services/blog.service";
import { useCreateBlogPost, useUpdateBlogPost } from "@/modules/blog/hooks/useBlog";
import AdminFormLayout from "@/components/layout/AdminFormLayout";
import { FormSection, Input, Textarea, Toggle } from "@/components/ui";
import RichTextEditor from "@/components/ui/RichTextEditor";
import {
  MdiInformation,
  MdiImageMultiple,
  MdiCheckCircle,
  MdiClose,
  MdiImageOff,
  MdiTagMultiple,
  LucideSearch,
  SvgSpinnersRingResize,
} from "@/components/icons/Icons";

const blogFormSchema = z.object({
  title: z
    .string()
    .min(3, "عنوان باید حداقل ۳ کاراکتر باشد")
    .max(200, "عنوان نمی‌تواند بیشتر از ۲۰۰ کاراکتر باشد"),
  excerpt: z
    .string()
    .max(500, "خلاصه نمی‌تواند بیشتر از ۵۰۰ کاراکتر باشد")
    .nullable(),
  content: z.string().min(20, "محتوا باید حداقل ۲۰ کاراکتر باشد"),
  cover_image: z
    .string()
    .refine((v) => !v || z.string().url().safeParse(v).success, "آدرس تصویر نامعتبر است")
    .nullable(),
  tags: z.array(z.string()),
  is_published: z.boolean(),
  seo_title: z.string().max(200).nullable(),
  seo_description: z.string().max(500).nullable(),
  seo_keywords: z.string().max(300).nullable(),
});

type BlogFormValues = z.infer<typeof blogFormSchema>;

export default function AdminBlogFormPage() {
  const router = useRouter();
  const params = useParams();
  const { isLoading: isAuthLoading } = useAdminRoute();
  const isEdit = params.id !== "new";

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingPost, setIsLoadingPost] = useState(isEdit);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const createBlogPost = useCreateBlogPost();
  const updateBlogPost = useUpdateBlogPost();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<BlogFormValues>({
    resolver: zodResolver(blogFormSchema),
    defaultValues: {
      title: "",
      excerpt: null,
      content: "",
      cover_image: null,
      tags: [],
      is_published: false,
      seo_title: null,
      seo_description: null,
      seo_keywords: null,
    },
  });

  const title = watch("title");
  const coverImage = watch("cover_image");
  const tags = watch("tags");
  const isPublished = watch("is_published");

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const post = await blogService.getByIdAdmin(params.id as string);
        reset({
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          cover_image: post.cover_image,
          tags: post.tags ?? [],
          is_published: post.is_published,
          seo_title: post.seo.title,
          seo_description: post.seo.description,
          seo_keywords: post.seo.keywords,
        });
      } catch {
        toast.error("خطا در دریافت اطلاعات مطلب");
        router.push("/admin/blog");
      } finally {
        setIsLoadingPost(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const handleCoverUpload = async (file: File) => {
    setUploadingCover(true);
    try {
      const url = await blogService.uploadImage(file);
      setValue("cover_image", url, { shouldValidate: true, shouldDirty: true });
      toast.success("تصویر بارگذاری شد");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "خطا در بارگذاری تصویر");
    } finally {
      setUploadingCover(false);
    }
  };

  const addTag = () => {
    const value = tagInput.trim().replace(/,$/, "").trim();
    if (!value) return;
    if (!tags.includes(value)) {
      setValue("tags", [...tags, value], { shouldDirty: true });
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setValue(
      "tags",
      tags.filter((t) => t !== tag),
      { shouldDirty: true },
    );
  };

  const onSubmit = async (data: BlogFormValues) => {
    setIsSubmitting(true);
    try {
      const payload = {
        title: data.title,
        excerpt: data.excerpt || null,
        content: data.content,
        cover_image: data.cover_image || null,
        tags: data.tags,
        is_published: data.is_published,
        seo_title: data.seo_title || null,
        seo_description: data.seo_description || null,
        seo_keywords: data.seo_keywords || null,
      };
      if (isEdit) {
        await updateBlogPost.mutateAsync({ id: params.id as string, data: payload });
      } else {
        await createBlogPost.mutateAsync(payload);
      }
      router.push("/admin/blog");
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
          <span className="text-sm text-text-secondary">انتشار مطلب</span>
          <Toggle
            label={isPublished ? "منتشر شده" : "پیش‌نویس"}
            checked={isPublished}
            onChange={(e) => setValue("is_published", e.target.checked)}
          />
        </div>
        <p className="text-xs text-text-muted">
          تاریخ انتشار هنگام انتشار به‌صورت خودکار ثبت می‌شود.
        </p>
      </FormSection>

      {/* Cover image */}
      <FormSection title="تصویر شاخص" icon={MdiImageMultiple}>
        <div className="relative aspect-[16/9] overflow-hidden rounded-card bg-surface-raised">
          {coverImage ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={coverImage}
                alt="پیش‌نمایش"
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => setValue("cover_image", null, { shouldDirty: true })}
                aria-label="حذف تصویر"
                className="absolute left-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-surface/90 text-text-primary shadow-card"
              >
                <MdiClose className="h-4 w-4" />
              </button>
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              {uploadingCover ? (
                <SvgSpinnersRingResize className="text-primary" width={32} />
              ) : (
                <MdiImageOff className="h-10 w-10 text-text-muted" />
              )}
            </div>
          )}
        </div>
        <label className="mt-3 inline-flex w-full cursor-pointer items-center justify-center rounded-button border border-border bg-surface px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:border-primary hover:text-primary">
          {uploadingCover ? "در حال بارگذاری..." : "انتخاب تصویر"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploadingCover}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleCoverUpload(file);
              e.target.value = "";
            }}
          />
        </label>
        {errors.cover_image?.message && (
          <p className="mt-2 text-xs text-error">{errors.cover_image.message}</p>
        )}
      </FormSection>

      {/* Tags */}
      <FormSection title="برچسب‌ها" icon={MdiTagMultiple}>
        <Input
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              addTag();
            }
          }}
          onBlur={addTag}
          placeholder="برچسب را تایپ کرده و Enter بزنید"
        />
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1.5 rounded-full bg-primary-light py-1 pl-2 pr-3 text-xs font-medium text-primary"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  aria-label={`حذف ${tag}`}
                  className="transition-colors hover:text-primary-hover"
                >
                  <MdiClose className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}
      </FormSection>
    </>
  );

  if (isLoadingPost && !isAuthLoading) {
    return (
      <AdminFormLayout
        title="ویرایش مطلب"
        loading
        onSubmit={() => {}}
        submitLabel="بروزرسانی"
      >
        <div />
      </AdminFormLayout>
    );
  }

  return (
    <AdminFormLayout
      title={isEdit ? "ویرایش مطلب" : "مطلب جدید"}
      subtitle={isEdit ? title || undefined : "افزودن مطلب جدید به وبلاگ"}
      loading={isAuthLoading}
      onBack={() => router.back()}
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={isSubmitting}
      submitLabel={isEdit ? "بروزرسانی" : "ایجاد"}
      aside={aside}
    >
      {/* Basic info */}
      <FormSection title="اطلاعات پایه" icon={MdiInformation}>
        <Input
          label="عنوان *"
          type="text"
          {...register("title")}
          error={errors.title?.message}
        />
        <Textarea
          label="خلاصه"
          {...register("excerpt")}
          error={errors.excerpt?.message}
          rows={3}
          hint="خلاصه‌ای کوتاه که در کارت‌ها و نتایج جستجو نمایش داده می‌شود"
        />
      </FormSection>

      {/* Content */}
      <FormSection title="محتوا">
        <Controller
          control={control}
          name="content"
          render={({ field }) => (
            <RichTextEditor
              value={field.value}
              onChange={field.onChange}
              onUploadImage={blogService.uploadImage}
              error={errors.content?.message}
            />
          )}
        />
      </FormSection>

      {/* SEO */}
      <FormSection
        title="سئو"
        description="بهینه‌سازی برای موتورهای جستجو"
        icon={LucideSearch}
      >
        <Input
          label="عنوان سئو"
          type="text"
          {...register("seo_title")}
          error={errors.seo_title?.message}
          hint="در صورت خالی بودن، از عنوان مطلب استفاده می‌شود"
        />
        <Textarea
          label="توضیحات سئو"
          {...register("seo_description")}
          error={errors.seo_description?.message}
          rows={3}
        />
        <Input
          label="کلمات کلیدی"
          type="text"
          {...register("seo_keywords")}
          error={errors.seo_keywords?.message}
          hint="کلمات کلیدی را با کاما جدا کنید"
        />
      </FormSection>
    </AdminFormLayout>
  );
}
