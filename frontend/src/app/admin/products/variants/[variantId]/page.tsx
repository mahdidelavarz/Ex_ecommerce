// src/app/(admin)/admin/products/variants/[variantId]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useAdminRoute } from '@/modules/auth/hooks/useAdminRoute';
import { variantService } from '@/modules/variants/services/variant.service';
import { productService } from '@/modules/products/services/product.service';
import { useAllAttributes } from '@/modules/attributes/hooks/useAttributes';
import AdminFormLayout from '@/components/layout/AdminFormLayout';
import { Checkbox, FormSection, Input, Toggle } from '@/components/ui';
import type { VariantImage } from '@/modules/variants/types/variant.types';
import { numberField, nullableNumberField } from '@/lib/forms';
import {
  MdiClose,
  MdiImageMultiple,
  MdiImageOff,
  MdiInformation,
  MdiPackageVariant,
  MdiCheckCircle,
  MdiTagMultiple,
  SvgSpinnersRingResize,
} from '@/components/icons/Icons';

const variantFormSchema = z.object({
  sku: z.string().min(1, 'کد محصول الزامی است'),
  barcode: z.string().nullable(),
  price: z.number({ error: 'قیمت الزامی است' }).min(0, 'قیمت الزامی است'),
  compare_at_price: z.number().min(0).nullable(),
  cost: z.number().min(0).optional(),
  weight: z.number().min(0).nullable(),
  stock_quantity: z.number().int().min(0).optional(),
  low_stock_threshold: z.number().int().min(0).nullable(),
  is_active: z.boolean(),
  attribute_value_ids: z.array(z.string()).optional(),
}).superRefine((data, ctx) => {
  if (data.compare_at_price != null && data.compare_at_price <= data.price) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'قیمت مقایسه باید بزرگ‌تر از قیمت فروش باشد',
      path: ['compare_at_price'],
    });
  }
  if (data.cost != null && data.cost > data.price) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'قیمت تمام شده نباید از قیمت فروش بیشتر باشد',
      path: ['cost'],
    });
  }
});

type VariantFormData = z.infer<typeof variantFormSchema>;

export default function AdminVariantFormPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const productId = searchParams.get('productId') || '';
  const isEdit = params.variantId !== 'new';
  const { isLoading: isAuthLoading } = useAdminRoute();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingVariant, setIsLoadingVariant] = useState(isEdit);
  const [variantImages, setVariantImages] = useState<VariantImage[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const { data: attributes } = useAllAttributes();

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<VariantFormData>({
    resolver: zodResolver(variantFormSchema),
    defaultValues: {
      sku: '',
      barcode: null,
      price: undefined,
      compare_at_price: null,
      cost: undefined,
      weight: null,
      stock_quantity: undefined,
      low_stock_threshold: null,
      is_active: true,
      attribute_value_ids: [],
    },
  });

  const isActive = watch('is_active');
  const watchedSku = watch('sku');

  useEffect(() => {
    if (isEdit) loadVariant(params.variantId as string);
  }, [params.variantId]);

  const loadVariant = async (id: string) => {
    setIsLoadingVariant(true);
    try {
      const variant = await variantService.getById(id);
      reset({
        sku: variant.sku,
        barcode: variant.barcode,
        price: variant.price,
        compare_at_price: variant.compare_at_price,
        cost: variant.cost,
        weight: variant.weight,
        stock_quantity: variant.stock_quantity,
        low_stock_threshold: variant.low_stock_threshold,
        is_active: variant.is_active,
        attribute_value_ids: variant.attributes?.map((a) => a.id) || [],
      });
      setVariantImages(variant.images || []);
    } catch {
      toast.error('خطا در دریافت اطلاعات');
      router.back();
    } finally {
      setIsLoadingVariant(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    setIsUploadingImage(true);
    try {
      const url = await productService.uploadImage(file);
      const image = await variantService.addImage(params.variantId as string, {
        image_url: url,
        sort_order: variantImages.length,
      });
      setVariantImages((prev) => [...prev, image]);
      toast.success('تصویر اضافه شد');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'خطا در بارگذاری تصویر');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleImageDelete = async (imageId: string) => {
    try {
      await variantService.deleteImage(imageId);
      setVariantImages((prev) => prev.filter((img) => img.id !== imageId));
      toast.success('تصویر حذف شد');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'خطا در حذف تصویر');
    }
  };

  const onSubmit = async (data: VariantFormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        barcode: data.barcode || null,
        cost: data.cost ?? 0,
        stock_quantity: data.stock_quantity ?? 0,
        compare_at_price: data.compare_at_price || null,
        weight: data.weight || null,
        low_stock_threshold: data.low_stock_threshold || null,
      };

      if (isEdit) {
        await variantService.update(params.variantId as string, payload);
        toast.success('واریانت بروزرسانی شد');
      } else {
        await variantService.create(productId, payload);
        toast.success('واریانت ایجاد شد');
      }
      router.back();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'خطا در ذخیره');
    } finally {
      setIsSubmitting(false);
    }
  };

  const aside = (
    <FormSection title="وضعیت" icon={MdiCheckCircle}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-text-secondary">نمایش در فروشگاه</span>
        <Toggle
          label={isActive ? 'فعال' : 'غیرفعال'}
          checked={isActive}
          onChange={(e) => setValue('is_active', e.target.checked)}
        />
      </div>
    </FormSection>
  );

  return (
    <AdminFormLayout
      title={isEdit ? 'ویرایش واریانت' : 'واریانت جدید'}
      subtitle={isEdit ? watchedSku || undefined : 'افزودن واریانت جدید برای محصول'}
      loading={isAuthLoading || isLoadingVariant}
      onBack={() => router.back()}
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={isSubmitting}
      submitLabel={isEdit ? 'بروزرسانی' : 'ایجاد واریانت'}
      aside={aside}
    >
      {/* Basic Info */}
      <FormSection title="اطلاعات پایه" icon={MdiInformation} columns={2}>
        <Input label="کد محصول (SKU) *" {...register('sku')} error={errors.sku?.message} />
        <Input label="بارکد" {...register('barcode')} />
        <Input label="قیمت (تومان) *" type="number" {...register('price', numberField)} error={errors.price?.message} />
        <Input label="قیمت مقایسه (تومان)" type="number" {...register('compare_at_price', nullableNumberField)} error={errors.compare_at_price?.message} />
        <Input label="قیمت تمام شده (تومان)" type="number" {...register('cost', numberField)} error={errors.cost?.message} />
        <Input label="وزن (گرم)" type="number" {...register('weight', nullableNumberField)} error={errors.weight?.message} />
      </FormSection>

      {/* Stock */}
      <FormSection title="موجودی" icon={MdiPackageVariant} columns={2}>
        <Input label="تعداد موجودی" type="number" {...register('stock_quantity', numberField)} error={errors.stock_quantity?.message} />
        <Input label="هشدار موجودی کم" type="number" {...register('low_stock_threshold', nullableNumberField)} error={errors.low_stock_threshold?.message} />
      </FormSection>

      {/* Images — only available once the variant exists */}
      {isEdit && (
        <FormSection title="تصاویر واریانت" icon={MdiImageMultiple}>
          <div className="flex flex-wrap gap-3">
            {variantImages.map((img) => (
              <div key={img.id} className="relative w-24 h-24 rounded-card overflow-hidden border border-border group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.image_url} alt="variant" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleImageDelete(img.id)}
                  className="absolute top-1 left-1 p-1 bg-error text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  title="حذف تصویر"
                >
                  <MdiClose className="w-3 h-3" />
                </button>
              </div>
            ))}

            {/* Upload tile */}
            <label className="w-24 h-24 rounded-card border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-primary text-text-muted hover:text-primary transition-colors">
              {isUploadingImage ? (
                <SvgSpinnersRingResize className="w-6 h-6" />
              ) : (
                <>
                  <MdiImageMultiple className="w-6 h-6" />
                  <span className="text-xs">افزودن</span>
                </>
              )}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                disabled={isUploadingImage}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file);
                  e.target.value = '';
                }}
              />
            </label>
          </div>
          {variantImages.length === 0 && !isUploadingImage && (
            <p className="flex items-center gap-2 text-sm text-text-muted">
              <MdiImageOff className="w-4 h-4" />
              هنوز تصویری برای این واریانت اضافه نشده است
            </p>
          )}
        </FormSection>
      )}

      {/* Attributes */}
      {attributes && attributes.length > 0 && (
        <FormSection title="ویژگی‌ها" icon={MdiTagMultiple}>
          <div className="space-y-4">
            {attributes.map((attr) => (
              <div key={attr.id}>
                <label className="text-sm font-medium text-text-secondary block mb-2">{attr.name}</label>
                <div className="flex flex-wrap gap-2">
                  {attr.values?.map((val) => (
                    <Checkbox
                      key={val.id}
                      value={val.id}
                      {...register('attribute_value_ids')}
                      label={
                        <span className="flex items-center gap-1">
                          {val.color_code && (
                            <span className="w-4 h-4 rounded-full border" style={{ backgroundColor: val.color_code }} />
                          )}
                          {val.value}
                        </span>
                      }
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </FormSection>
      )}
    </AdminFormLayout>
  );
}
