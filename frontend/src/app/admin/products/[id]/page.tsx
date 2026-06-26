// src/app/(admin)/admin/products/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { useAdminRoute } from "@/modules/auth/hooks/useAdminRoute";
import { productService } from "@/modules/products/services/product.service";
import { variantService } from "@/modules/variants/services/variant.service";
import { useCategories } from "@/modules/categories/hooks/useCategories";
import { useAllBrands } from "@/modules/brands/hooks/useBrands";
import { useAllAttributes } from "@/modules/attributes/hooks/useAttributes";
import { useAllTags } from "@/modules/tags/hooks/useTags";
import { useVariants } from "@/modules/variants/hooks/useVariants";
import AdminSidebar from "@/components/layout/AdminSidebar";
import { Badge, Button, Card, Checkbox, EmptyState, Input, Select, Textarea, Toggle } from "@/components/ui";
import { formatPrice } from "@/utils/formatPrice";
import type { ProductVariant } from "@/modules/variants/types/variant.types";
import { LucidePencil, LucidePlus, LucideSearch, MdiArrowRight, MdiClose, MdiImageMultiple, MdiInformation, MdiPackageVariant, MdiPackageVariantClosed, MdiTrashCan, SvgSpinnersRingResize } from "@/components/icons/Icons";

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
  tag_ids: z.array(z.string()).optional(),
  specifications: z
    .array(z.object({ key: z.string(), value: z.string() }))
    .optional(),
  images: z
    .array(
      z.object({
        image_url: z.string().min(1, "آدرس تصویر الزامی است"),
        alt_text: z.string().optional(),
        is_thumbnail: z.boolean().optional(),
      }),
    )
    .optional(),
});

type ProductFormData = z.infer<typeof productFormSchema>;

// Tab types
type Tab = "basic" | "images" | "variants" | "seo";

export default function AdminProductFormPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const isEdit = productId !== "new";
  const { isLoading: isAuthLoading } = useAdminRoute();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("basic");

  // Data
  const { data: categoriesData } = useCategories({ limit: 100 });
  const { data: brandsData } = useAllBrands();
  const { data: attributes } = useAllAttributes();
  const { data: tags } = useAllTags();
  const { data: variants, refetch: refetchVariants } = useVariants(
    isEdit ? productId : "",
  );

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    control,
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
      tag_ids: [],
      specifications: [],
      images: [{ image_url: "", alt_text: "", is_thumbnail: true }],
    },
  });

  const {
    fields: imageFields,
    append: addImage,
    remove: removeImage,
  } = useFieldArray({ control, name: "images" });

  const {
    fields: specFields,
    append: addSpec,
    remove: removeSpec,
  } = useFieldArray({ control, name: "specifications" });

  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  const handleImageUpload = async (index: number, file: File) => {
    setUploadingIndex(index);
    try {
      const url = await productService.uploadImage(file);
      setValue(`images.${index}.image_url`, url, { shouldValidate: true, shouldDirty: true });
      toast.success("تصویر بارگذاری شد");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "خطا در بارگذاری تصویر");
    } finally {
      setUploadingIndex(null);
    }
  };

  const isActive = watch("is_active");
  const isPublic = watch("is_public");
  const watchedImages = watch("images");
  const selectedTags = watch("tag_ids") || [];

  // Variant form state (separate from product form)
  const [showVariantForm, setShowVariantForm] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(
    null,
  );
  const [variantForm, setVariantForm] = useState({
    sku: "",
    barcode: "",
    price: "" as number | "",
    compare_at_price: null as number | null,
    cost: "" as number | "",
    weight: null as number | null,
    stock_quantity: "" as number | "",
    low_stock_threshold: null as number | null,
    is_active: true,
    attribute_value_ids: [] as string[],
  });

  useEffect(() => {
    if (isEdit) loadProduct(productId);
  }, [productId]);

  const loadProduct = async (id: string) => {
    try {
      const isUUID =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          id,
        );
      const product = isUUID
        ? await productService.getById(id)
        : await productService.getBySlug(id);
      reset({
        category_id: product.category?.id || "",
        brand_id: product.brand?.id || null,
        title: product.title,
        short_description: product.short_description,
        full_description: product.full_description,
        seo_title: product.seo?.title,
        seo_description: product.seo?.description,
        is_active: true,
        is_public: true,
        tag_ids: product.tags?.map((t) => t.id) || [],
        specifications: product.specification
          ? Object.entries(product.specification).map(([key, value]) => ({
              key,
              value: String(value),
            }))
          : [],
        images:
          product.images?.length > 0
            ? product.images.map((img) => ({
                image_url: img.image_url,
                alt_text: img.alt_text || "",
                is_thumbnail: img.is_thumbnail,
              }))
            : [{ image_url: "", alt_text: "", is_thumbnail: true }],
      });
    } catch (error) {
      toast.error("خطا در دریافت اطلاعات محصول");
      router.push("/admin/products");
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    try {
      // Convert the key/value editor rows into a specification object (drop
      // rows with an empty key); send null when there are none.
      const specEntries = (data.specifications ?? [])
        .filter((s) => s.key.trim())
        .map((s) => [s.key.trim(), s.value] as const);

      const { specifications: _specifications, ...rest } = data;
      const payload = {
        ...rest,
        brand_id: data.brand_id || null,
        short_description: data.short_description || null,
        full_description: data.full_description || null,
        seo_title: data.seo_title || null,
        seo_description: data.seo_description || null,
        specification: specEntries.length ? Object.fromEntries(specEntries) : null,
        images: data.images?.filter((img) => img.image_url.trim()),
      };

      if (isEdit) {
        await productService.update(productId, payload);
        await productService.syncTags(productId, data.tag_ids || []);
        toast.success("محصول بروزرسانی شد");
      } else {
        const newProduct = await productService.create(payload);
        if (data.tag_ids?.length) {
          await productService.syncTags(newProduct.id, data.tag_ids);
        }
        toast.success("محصول ایجاد شد");
        // Redirect to edit page with real ID
        router.push(`/admin/products/${newProduct.id}`);
        return; // ← مهم: return کن تا ادامه نده
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "خطا در ذخیره");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Variant handlers
  const handleSaveVariant = async () => {
    if (!variantForm.sku || variantForm.price === "" || variantForm.price == null) {
      toast.error("کد محصول و قیمت الزامی است");
      return;
    }

    const variantPayload = {
      ...variantForm,
      price: Number(variantForm.price),
      cost: variantForm.cost === "" ? 0 : Number(variantForm.cost),
      stock_quantity: variantForm.stock_quantity === "" ? 0 : Number(variantForm.stock_quantity),
    };

    try {
      if (editingVariant) {
        await variantService.update(editingVariant.id, variantPayload);
        toast.success("واریانت بروزرسانی شد");
      } else {
        await variantService.create(productId, variantPayload as any);
        toast.success("واریانت اضافه شد");
      }
      resetVariantForm();
      refetchVariants();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "خطا در ذخیره واریانت");
    }
  };

  const handleEditVariant = (variant: ProductVariant) => {
    setEditingVariant(variant);
    setVariantForm({
      sku: variant.sku,
      barcode: variant.barcode || "",
      price: variant.price,
      compare_at_price: variant.compare_at_price,
      cost: variant.cost,
      weight: variant.weight,
      stock_quantity: variant.stock_quantity,
      low_stock_threshold: variant.low_stock_threshold,
      is_active: variant.is_active,
      attribute_value_ids: variant.attributes?.map((a: any) => a.id) || [],
    });
    setShowVariantForm(true);
  };

  const handleDeleteVariant = async (variant: ProductVariant) => {
    if (!window.confirm(`حذف واریانت "${variant.sku}"؟`)) return;
    try {
      await variantService.delete(variant.id);
      toast.success("واریانت حذف شد");
      refetchVariants();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "خطا");
    }
  };

  const resetVariantForm = () => {
    setEditingVariant(null);
    setVariantForm({
      sku: "",
      barcode: "",
      price: "",
      compare_at_price: null,
      cost: "",
      weight: null,
      stock_quantity: "",
      low_stock_threshold: null,
      is_active: true,
      attribute_value_ids: [],
    });
    setShowVariantForm(false);
  };

  const toggleTag = (tagId: string) => {
    const current = selectedTags;
    const updated = current.includes(tagId)
      ? current.filter((id) => id !== tagId)
      : [...current, tagId];
    setValue("tag_ids", updated);
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
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-surface-raised rounded-button"
              >
                <MdiArrowRight
                  className="w-5 h-5 text-text-secondary"
                />
              </button>
              <h1 className="text-2xl font-bold text-text-primary">
                {isEdit ? "ویرایش محصول" : "محصول جدید"}
              </h1>
            </div>
            <Button type="submit" form="product-form" loading={isSubmitting}>
              ذخیره محصول
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border mb-6">
            {[
              { key: "basic", label: "اطلاعات پایه", icon: <MdiInformation/> },
              { key: "images", label: "تصاویر", icon: <MdiImageMultiple/> },
              ...(isEdit
                ? [
                    {
                      key: "variants",
                      label: "واریانت‌ها",
                      icon: <MdiPackageVariant/>,
                      count: variants?.length,
                    },
                  ]
                : []),
              { key: "seo", label: "سئو", icon: <LucideSearch/>  },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as Tab)}
                className={`flex items-center gap-2 px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? "border-primary text-primary"
                    : "border-transparent text-text-secondary hover:text-text-primary"
                }`}
              >
                <div className="w-4 h-4">
                  {tab.icon}
                </div>
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="bg-primary-light text-primary text-xs px-1.5 py-0.5 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <form id="product-form" onSubmit={handleSubmit(onSubmit)}>
            {/* TAB: Basic Info */}
            {activeTab === "basic" && (
              <div className="space-y-6">
                <Card className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="عنوان *"
                      wrapperClassName="md:col-span-2"
                      {...register("title")}
                      error={errors.title?.message}
                    />

                    <Select label="دسته‌بندی *" {...register("category_id")} error={errors.category_id?.message}>
                      <option value="">انتخاب کنید</option>
                      {categoriesData?.data?.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </Select>

                    <Select label="برند" {...register("brand_id")}>
                      <option value="">بدون برند</option>
                      {brandsData?.map((brand) => (
                        <option key={brand.id} value={brand.id}>
                          {brand.name}
                        </option>
                      ))}
                    </Select>

                    <Input
                      label="توضیح کوتاه"
                      wrapperClassName="md:col-span-2"
                      {...register("short_description")}
                    />

                    <Textarea
                      label="توضیحات کامل"
                      wrapperClassName="md:col-span-2"
                      {...register("full_description")}
                      rows={8}
                    />
                  </div>
                </Card>

                {/* Status */}
                <Card className="p-6">
                  <h3 className="font-medium text-text-primary mb-4">وضعیت</h3>
                  <div className="flex gap-8">
                    <Toggle
                      label={isActive ? "فعال" : "غیرفعال"}
                      checked={isActive}
                      onChange={(e) => setValue("is_active", e.target.checked)}
                    />
                    <Toggle
                      label={isPublic ? "منتشر شده" : "پیش‌نویس"}
                      checked={isPublic}
                      onChange={(e) => setValue("is_public", e.target.checked)}
                    />
                  </div>
                </Card>

                {/* Tags */}
                {tags && tags.length > 0 && (
                  <Card className="p-6">
                    <h3 className="font-medium text-text-primary mb-4">
                      برچسب‌ها
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => toggleTag(tag.id)}
                          className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                            selectedTags.includes(tag.id)
                              ? "bg-primary text-white border-primary"
                              : "bg-surface text-text-secondary border-border hover:border-primary"
                          }`}
                        >
                          {tag.name}
                        </button>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Specifications (jsonb key/value pairs) */}
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-text-primary">مشخصات فنی</h3>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => addSpec({ key: "", value: "" })}
                    >
                      + افزودن مشخصه
                    </Button>
                  </div>

                  {specFields.length === 0 ? (
                    <p className="text-sm text-text-muted">
                      مشخصه‌ای ثبت نشده است. مثال: جنس → نخ پنبه
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {specFields.map((field, index) => (
                        <div key={field.id} className="flex items-center gap-3">
                          <Input
                            wrapperClassName="flex-1"
                            {...register(`specifications.${index}.key`)}
                            placeholder="عنوان (مثلاً: جنس)"
                            className="text-sm"
                          />
                          <Input
                            wrapperClassName="flex-1"
                            {...register(`specifications.${index}.value`)}
                            placeholder="مقدار (مثلاً: نخ پنبه)"
                            className="text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => removeSpec(index)}
                            className="p-2 hover:bg-error-light rounded-button text-error"
                            title="حذف"
                          >
                            <MdiClose className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>
            )}

            {/* TAB: Images */}
            {activeTab === "images" && (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-medium text-text-primary">
                    تصاویر محصول
                  </h3>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      addImage({
                        image_url: "",
                        alt_text: "",
                        is_thumbnail: false,
                      })
                    }
                  >
                    + افزودن تصویر
                  </Button>
                </div>
                <div className="space-y-4">
                  {imageFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="flex items-start gap-4 p-4 bg-surface-raised rounded-card"
                    >
                      {/* Preview */}
                      <div className="w-20 h-20 flex-shrink-0 rounded-card border border-border bg-surface overflow-hidden flex items-center justify-center">
                        {watchedImages?.[index]?.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={watchedImages[index].image_url}
                            alt="preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <MdiImageMultiple className="w-6 h-6 text-text-muted" />
                        )}
                      </div>
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-2">
                          <Input
                            label="آدرس تصویر"
                            dir="ltr"
                            {...register(`images.${index}.image_url`)}
                            placeholder="https://..."
                            className="text-sm"
                          />
                          <label className="inline-flex items-center gap-2 mt-2 cursor-pointer text-xs text-primary hover:underline">
                            {uploadingIndex === index ? (
                              <>
                                <SvgSpinnersRingResize className="w-4 h-4" />
                                در حال بارگذاری...
                              </>
                            ) : (
                              <>
                                <MdiImageMultiple className="w-4 h-4" />
                                بارگذاری فایل
                              </>
                            )}
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp,image/gif"
                              className="hidden"
                              disabled={uploadingIndex !== null}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleImageUpload(index, file);
                                e.target.value = "";
                              }}
                            />
                          </label>
                        </div>
                        <Input
                          label="متن جایگزین"
                          {...register(`images.${index}.alt_text`)}
                          placeholder="توضیح تصویر"
                          className="text-sm"
                        />
                      </div>
                      <div className="mt-6">
                        <Checkbox
                          label={<span className="text-xs">تصویر اصلی</span>}
                          {...register(`images.${index}.is_thumbnail`)}
                        />
                      </div>
                      {imageFields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="p-2 hover:bg-error-light rounded-button text-error mt-5"
                        >
                          <MdiClose className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* TAB: Variants */}
            {activeTab === "variants" && (
              <div className="space-y-6">
                {/* Add/Edit Variant Form */}
                {showVariantForm && (
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-medium text-text-primary">
                        {editingVariant ? "ویرایش واریانت" : "واریانت جدید"}
                      </h3>
                      <button
                        onClick={resetVariantForm}
                        className="p-2 hover:bg-surface-raised rounded-button"
                      >
                        <MdiClose className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <Input
                        label="کد محصول (SKU) *"
                        value={variantForm.sku}
                        onChange={(e) => setVariantForm({ ...variantForm, sku: e.target.value })}
                        className="text-sm"
                      />
                      <Input
                        label="بارکد"
                        value={variantForm.barcode}
                        onChange={(e) => setVariantForm({ ...variantForm, barcode: e.target.value })}
                        className="text-sm"
                      />
                      <Input
                        label="قیمت (تومان) *"
                        type="number"
                        value={variantForm.price}
                        onChange={(e) => setVariantForm({ ...variantForm, price: e.target.value === "" ? "" : parseInt(e.target.value) })}
                        className="text-sm"
                      />
                      <Input
                        label="قیمت مقایسه"
                        type="number"
                        value={variantForm.compare_at_price || ""}
                        onChange={(e) => setVariantForm({ ...variantForm, compare_at_price: e.target.value ? parseInt(e.target.value) : null })}
                        className="text-sm"
                      />
                      <Input
                        label="موجودی"
                        type="number"
                        value={variantForm.stock_quantity}
                        onChange={(e) => setVariantForm({ ...variantForm, stock_quantity: e.target.value === "" ? "" : parseInt(e.target.value) })}
                        className="text-sm"
                      />
                      <Input
                        label="هشدار موجودی"
                        type="number"
                        value={variantForm.low_stock_threshold || ""}
                        onChange={(e) => setVariantForm({ ...variantForm, low_stock_threshold: e.target.value ? parseInt(e.target.value) : null })}
                        className="text-sm"
                      />
                    </div>

                    {/* Attributes */}
                    {attributes && attributes.length > 0 && (
                      <div className="mb-6">
                        <label className="text-sm font-medium text-text-secondary block mb-3">
                          ویژگی‌ها
                        </label>
                        <div className="space-y-3">
                          {attributes.map((attr) => (
                            <div key={attr.id}>
                              <p className="text-xs text-text-muted mb-2">
                                {attr.name}
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {attr.values?.map((val) => (
                                  <button
                                    key={val.id}
                                    type="button"
                                    onClick={() => {
                                      const current =
                                        variantForm.attribute_value_ids;
                                      const updated = current.includes(val.id)
                                        ? current.filter((id) => id !== val.id)
                                        : [...current, val.id];
                                      setVariantForm({
                                        ...variantForm,
                                        attribute_value_ids: updated,
                                      });
                                    }}
                                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs border transition-colors ${
                                      variantForm.attribute_value_ids.includes(
                                        val.id,
                                      )
                                        ? "bg-primary text-white border-primary"
                                        : "bg-surface text-text-secondary border-border hover:border-primary"
                                    }`}
                                  >
                                    {val.color_code && (
                                      <span
                                        className="w-3 h-3 rounded-full"
                                        style={{
                                          backgroundColor: val.color_code,
                                        }}
                                      />
                                    )}
                                    {val.value}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <Button type="button" onClick={handleSaveVariant}>
                        {editingVariant ? "بروزرسانی" : "افزودن واریانت"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={resetVariantForm}
                      >
                        انصراف
                      </Button>
                    </div>
                  </Card>
                )}

                {/* Variants List */}
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-medium text-text-primary">
                      واریانت‌ها ({variants?.length || 0})
                    </h3>
                    {!showVariantForm && (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => setShowVariantForm(true)}
                        icon={LucidePlus}
                      >
                        واریانت جدید
                      </Button>
                    )}
                  </div>

                  {variants?.length === 0 ? (
                    <EmptyState icon={MdiPackageVariantClosed} title="هیچ واریانتی ثبت نشده" />
                  ) : (
                    <div className="space-y-3">
                      {variants?.map((variant) => (
                        <div
                          key={variant.id}
                          className="flex items-center justify-between p-3 bg-surface-raised rounded-card"
                        >
                          <div>
                            <p className="font-medium text-text-primary text-sm">
                              {variant.sku}
                            </p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-sm text-text-secondary">
                                {formatPrice(variant.price)}
                              </span>
                              <span
                                className={`text-xs ${variant.stock_quantity > 0 ? "text-success" : "text-error"}`}
                              >
                                موجودی: {variant.stock_quantity}
                              </span>
                              <Badge variant={variant.is_active ? "success" : "error"} size="sm">
                                {variant.is_active ? "فعال" : "غیرفعال"}
                              </Badge>
                            </div>
                            {variant.attributes?.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {variant.attributes.map(
                                  (attr: any, i: number) => (
                                    <span
                                      key={i}
                                      className="text-xs text-text-muted bg-surface px-1.5 py-0.5 rounded"
                                    >
                                      {attr.value}
                                    </span>
                                  ),
                                )}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleEditVariant(variant)}
                              className="p-2 hover:bg-primary-light rounded-button text-primary"
                            >
                              <LucidePencil className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteVariant(variant)}
                              className="p-2 hover:bg-error-light rounded-button text-error"
                            >
                              <MdiTrashCan className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>
            )}

            {/* TAB: SEO */}
            {activeTab === "seo" && (
              <Card className="p-6 space-y-6">
                <h3 className="font-medium text-text-primary">تنظیمات سئو</h3>
                <Input label="عنوان سئو" {...register("seo_title")} />
                <Textarea label="توضیحات سئو" {...register("seo_description")} rows={3} />
              </Card>
            )}
          </form>
        </div>
      </main>
    </div>
  );
}
