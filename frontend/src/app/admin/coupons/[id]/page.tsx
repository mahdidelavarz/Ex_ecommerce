// src/app/(admin)/admin/coupons/[id]/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useAdminRoute } from '@/modules/auth/hooks/useAdminRoute';
import { useCreateCoupon, useUpdateCoupon } from '@/modules/coupons/hooks/useCoupons';
import { couponService } from '@/modules/coupons/services/coupon.service';
import { useCategories } from '@/modules/categories/hooks/useCategories';
import AdminSidebar from '@/components/layout/AdminSidebar';
import { Button, Card, Checkbox, Input, Select } from '@/components/ui';
import { useProducts } from '@/modules/products/hooks/useProducts';
import { MdiArrowRight, SvgSpinnersRingResize } from '@/components/icons/Icons';

const typeOptions = [
  { value: 'percentage', label: 'درصدی' },
  { value: 'fixed', label: 'مبلغ ثابت' },
  { value: 'free_shipping', label: 'ارسال رایگان' },
];

const formSchema = z.object({
  code: z.string().min(1, 'کد الزامی است').max(50),
  type: z.enum(['percentage', 'fixed', 'free_shipping']),
  value: z.number().min(0),
  min_order_amount: z.number().min(0).nullable(),
  max_discount: z.number().min(0).nullable(),
  usage_limit: z.number().int().min(1).nullable(),
  usage_per_user: z.number().int().min(1).nullable(),
  starts_at: z.string().min(1, 'تاریخ شروع الزامی است'),
  expires_at: z.string().min(1, 'تاریخ انقضا الزامی است'),
  is_active: z.boolean(),
  product_ids: z.array(z.string()).optional(),
  category_ids: z.array(z.string()).optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function AdminCouponFormPage() {
  const router = useRouter();
  const params = useParams();
  const isEdit = params.id !== 'new';
  const { isLoading: isAuthLoading } = useAdminRoute();
  const createCoupon = useCreateCoupon();
  const updateCoupon = useUpdateCoupon();
  const isSubmitting = createCoupon.isPending || updateCoupon.isPending;

  const { data: productsData } = useProducts({ limit: 200 });
  const { data: categoriesData } = useCategories({ limit: 100 });

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: '', type: 'percentage', value: 10, min_order_amount: null, max_discount: null,
      usage_limit: null, usage_per_user: 1, starts_at: '', expires_at: '', is_active: true,
      product_ids: [], category_ids: [],
    },
  });

  const type = watch('type');
  const selectedProducts = watch('product_ids') || [];
  const selectedCategories = watch('category_ids') || [];

  useEffect(() => {
    if (isEdit) {
      couponService.getById(params.id as string).then((c) => {
        reset({
          code: c.code, type: c.type, value: c.value,
          min_order_amount: c.min_order_amount, max_discount: c.max_discount,
          usage_limit: c.usage_limit, usage_per_user: c.usage_per_user,
          starts_at: c.starts_at?.split('T')[0], expires_at: c.expires_at?.split('T')[0],
          is_active: c.is_active,
          product_ids: c.products?.map((p) => p.id) || [],
          category_ids: c.categories?.map((cat) => cat.id) || [],
        });
      }).catch(() => { toast.error('خطا'); router.back(); });
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
        await updateCoupon.mutateAsync({ id: params.id as string, data: payload });
      } else {
        await createCoupon.mutateAsync(payload);
      }
      router.push('/admin/coupons');
    } catch {
      // toast handled by mutation hook
    }
  };

  if (isAuthLoading) return <div className="flex items-center justify-center min-h-screen"><SvgSpinnersRingResize className="  text-primary" width={48} /></div>;

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 lg:mr-64 p-4 lg:p-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <button onClick={() => router.back()} className="p-2 hover:bg-surface-raised rounded-button"><MdiArrowRight className="w-5 h-5" /></button>
            <h1 className="text-2xl font-bold text-text-primary">{isEdit ? 'ویرایش' : 'کد تخفیف جدید'}</h1>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Card className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="کد تخفیف *"
                className="uppercase"
                {...register('code')}
                error={errors.code?.message}
              />
              <Select label="نوع *" options={typeOptions} {...register('type')} />
              {type !== 'free_shipping' && (
                <Input
                  label={`${type === 'percentage' ? 'درصد' : 'مبلغ (تومان)'} *`}
                  type="number"
                  {...register('value', { valueAsNumber: true })}
                  error={errors.value?.message}
                />
              )}
              <Input
                label="حداقل سفارش (تومان)"
                type="number"
                {...register('min_order_amount', { valueAsNumber: true })}
              />
              {type === 'percentage' && (
                <Input
                  label="حداکثر تخفیف (تومان)"
                  type="number"
                  {...register('max_discount', { valueAsNumber: true })}
                />
              )}
              <Input
                label="محدودیت تعداد"
                type="number"
                {...register('usage_limit', { valueAsNumber: true })}
              />
              <Input
                label="محدودیت برای هر کاربر"
                type="number"
                {...register('usage_per_user', { valueAsNumber: true })}
              />
              <Input
                label="تاریخ شروع *"
                type="date"
                {...register('starts_at')}
                error={errors.starts_at?.message}
              />
              <Input
                label="تاریخ انقضا *"
                type="date"
                {...register('expires_at')}
                error={errors.expires_at?.message}
              />
            </Card>

            {/* Status */}
            <Card className="p-6">
              <Checkbox label="فعال" {...register('is_active')} />
            </Card>

            {/* Product Restrictions */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-text-primary">محدودیت محصول</h3>
                {selectedProducts.length > 0 && (
                  <button type="button" onClick={() => setValue('product_ids', [])} className="text-xs text-error hover:underline">
                    حذف همه
                  </button>
                )}
              </div>
              <p className="text-xs text-text-muted mb-3">اگر انتخاب نشود، کد برای همه محصولات معتبر است.</p>
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
                      setValue('product_ids', next);
                    }}
                  />
                ))}
              </div>
              {selectedProducts.length > 0 && (
                <p className="text-xs text-primary mt-2">{selectedProducts.length} محصول انتخاب شده</p>
              )}
            </Card>

            {/* Category Restrictions */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-text-primary">محدودیت دسته‌بندی</h3>
                {selectedCategories.length > 0 && (
                  <button type="button" onClick={() => setValue('category_ids', [])} className="text-xs text-error hover:underline">
                    حذف همه
                  </button>
                )}
              </div>
              <p className="text-xs text-text-muted mb-3">اگر انتخاب نشود، کد برای همه دسته‌بندی‌ها معتبر است.</p>
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
                      setValue('category_ids', next);
                    }}
                  />
                ))}
              </div>
              {selectedCategories.length > 0 && (
                <p className="text-xs text-primary mt-2">{selectedCategories.length} دسته‌بندی انتخاب شده</p>
              )}
            </Card>

            <div className="flex gap-4">
              <Button type="submit" loading={isSubmitting} size="lg">{isEdit ? 'بروزرسانی' : 'ایجاد'}</Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>انصراف</Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}