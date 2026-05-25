// src/app/(admin)/admin/products/variants/[variantId]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Icon } from '@iconify/react';
import toast from 'react-hot-toast';
import { useAdminRoute } from '@/modules/auth/hooks/useAdminRoute';
import { variantService } from '@/modules/variants/services/variant.service';
import { useAllAttributes } from '@/modules/attributes/hooks/useAttributes';
import AdminSidebar from '@/components/layout/AdminSidebar';
import Button from '@/components/ui/Button';

const variantFormSchema = z.object({
  sku: z.string().min(1, 'کد محصول الزامی است'),
  barcode: z.string().nullable(),
  price: z.number().min(0, 'قیمت الزامی است'),
  compare_at_price: z.number().min(0).nullable(),
  cost: z.number().min(0),
  weight: z.number().min(0).nullable(),
  stock_quantity: z.number().int().min(0),
  low_stock_threshold: z.number().int().min(0).nullable(),
  is_active: z.boolean(),
  attribute_value_ids: z.array(z.string()).optional(),
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
  const { data: attributes } = useAllAttributes();

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<VariantFormData>({
    resolver: zodResolver(variantFormSchema),
    defaultValues: {
      sku: '',
      barcode: null,
      price: 0,
      compare_at_price: null,
      cost: 0,
      weight: null,
      stock_quantity: 0,
      low_stock_threshold: null,
      is_active: true,
      attribute_value_ids: [],
    },
  });

  const isActive = watch('is_active');

  useEffect(() => {
    if (isEdit) loadVariant(params.variantId as string);
  }, [params.variantId]);

  const loadVariant = async (id: string) => {
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
    } catch (error) {
      toast.error('خطا در دریافت اطلاعات');
      router.back();
    }
  };

  const onSubmit = async (data: VariantFormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        barcode: data.barcode || null,
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

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Icon icon="mdi:loading" className="animate-spin text-primary" width={48} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 lg:mr-64 p-4 lg:p-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <button onClick={() => router.back()} className="p-2 hover:bg-surface-raised rounded-button">
              <Icon icon="mdi:arrow-right" className="w-5 h-5 text-text-secondary" />
            </button>
            <h1 className="text-2xl font-bold text-text-primary">
              {isEdit ? 'ویرایش واریانت' : 'واریانت جدید'}
            </h1>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="bg-surface rounded-card shadow-card p-6">
                <h2 className="text-lg font-bold text-text-primary mb-6">اطلاعات پایه</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-secondary">کد محصول (SKU) *</label>
                    <input {...register('sku')} className="w-full px-4 py-2 bg-surface border border-border rounded-input focus:outline-none focus:ring-2 focus:ring-primary" />
                    {errors.sku && <p className="text-sm text-error">{errors.sku.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-secondary">بارکد</label>
                    <input {...register('barcode')} className="w-full px-4 py-2 bg-surface border border-border rounded-input focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-secondary">قیمت (تومان) *</label>
                    <input type="number" {...register('price', { valueAsNumber: true })} className="w-full px-4 py-2 bg-surface border border-border rounded-input focus:outline-none focus:ring-2 focus:ring-primary" />
                    {errors.price && <p className="text-sm text-error">{errors.price.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-secondary">قیمت مقایسه (تومان)</label>
                    <input type="number" {...register('compare_at_price', { valueAsNumber: true })} className="w-full px-4 py-2 bg-surface border border-border rounded-input focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-secondary">قیمت تمام شده (تومان)</label>
                    <input type="number" {...register('cost', { valueAsNumber: true })} className="w-full px-4 py-2 bg-surface border border-border rounded-input focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-secondary">وزن (گرم)</label>
                    <input type="number" {...register('weight', { valueAsNumber: true })} className="w-full px-4 py-2 bg-surface border border-border rounded-input focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                </div>
              </div>

              {/* Stock */}
              <div className="bg-surface rounded-card shadow-card p-6">
                <h2 className="text-lg font-bold text-text-primary mb-6">موجودی</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-secondary">تعداد موجودی</label>
                    <input type="number" {...register('stock_quantity', { valueAsNumber: true })} className="w-full px-4 py-2 bg-surface border border-border rounded-input focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-secondary">هشدار موجودی کم</label>
                    <input type="number" {...register('low_stock_threshold', { valueAsNumber: true })} className="w-full px-4 py-2 bg-surface border border-border rounded-input focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="bg-surface rounded-card shadow-card p-6">
                <h2 className="text-lg font-bold text-text-primary mb-4">وضعیت</h2>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={isActive} onChange={(e) => setValue('is_active', e.target.checked)} className="sr-only peer" />
                  <div className="w-11 h-6 bg-border rounded-full peer-checked:bg-success relative after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" />
                  <span className="text-sm text-text-secondary">{isActive ? 'فعال' : 'غیرفعال'}</span>
                </label>
              </div>

              {/* Attributes */}
              {attributes && attributes.length > 0 && (
                <div className="bg-surface rounded-card shadow-card p-6">
                  <h2 className="text-lg font-bold text-text-primary mb-6">ویژگی‌ها</h2>
                  <div className="space-y-4">
                    {attributes.map((attr) => (
                      <div key={attr.id}>
                        <label className="text-sm font-medium text-text-secondary block mb-2">{attr.name}</label>
                        <div className="flex flex-wrap gap-2">
                          {attr.values?.map((val) => (
                            <label key={val.id} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                value={val.id}
                                {...register('attribute_value_ids')}
                                className="rounded"
                              />
                              <span className="flex items-center gap-1 text-sm text-text-primary">
                                {val.color_code && (
                                  <span className="w-4 h-4 rounded-full border" style={{ backgroundColor: val.color_code }} />
                                )}
                                {val.value}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-4">
                <Button type="submit" loading={isSubmitting} size="lg">
                  {isEdit ? 'بروزرسانی' : 'ایجاد واریانت'}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.back()}>
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