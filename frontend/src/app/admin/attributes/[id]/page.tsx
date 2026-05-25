// src/app/(admin)/admin/attributes/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Icon } from '@iconify/react';
import toast from 'react-hot-toast';
import { useAdminRoute } from '@/modules/auth/hooks/useAdminRoute';

import AdminSidebar from '@/components/layout/AdminSidebar';
import Button from '@/components/ui/Button';
import { attributeService } from '@/modules/attributes/services/attribute.service';

const valueSchema = z.object({
  value: z.string().min(1, 'مقدار الزامی است').max(100),
  color_code: z.string().regex(/^#([A-Fa-f0-9]{6})$/, 'کد رنگ نامعتبر').optional().or(z.literal('')),
});

const attributeFormSchema = z.object({
  name: z.string().min(1, 'نام ویژگی الزامی است').max(100),
  values: z.array(valueSchema).optional(),
});

type AttributeFormData = z.infer<typeof attributeFormSchema>;

export default function AdminAttributeFormPage() {
  const router = useRouter();
  const params = useParams();
  const isEdit = params.id !== 'new';
  const { isLoading: isAuthLoading } = useAdminRoute();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<AttributeFormData>({
    resolver: zodResolver(attributeFormSchema),
    defaultValues: {
      name: '',
      values: [{ value: '', color_code: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'values',
  });

  useEffect(() => {
    if (isEdit) loadAttribute(params.id as string);
  }, [params.id]);

  const loadAttribute = async (id: string) => {
    try {
      const attr = await attributeService.getById(id);
      reset({
        name: attr.name,
        values: attr.values?.length > 0
          ? attr.values.map((v) => ({ value: v.value, color_code: v.color_code || '' }))
          : [{ value: '', color_code: '' }],
      });
    } catch (error) {
      toast.error('خطا در دریافت اطلاعات');
      router.push('/admin/attributes');
    }
  };

  const onSubmit = async (data: AttributeFormData) => {
    setIsSubmitting(true);
    try {
      if (isEdit) {
        await attributeService.update(params.id as string, { name: data.name });
        toast.success('ویژگی بروزرسانی شد');
      } else {
        const values = data.values?.filter((v) => v.value.trim()).map((v) => ({
          value: v.value,
          color_code: v.color_code || undefined,
        }));
        await attributeService.create({ name: data.name, values: values?.length ? values : undefined });
        toast.success('ویژگی ایجاد شد');
      }
      router.push('/admin/attributes');
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
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <button onClick={() => router.back()} className="p-2 hover:bg-surface-raised rounded-button">
              <Icon icon="mdi:arrow-right" className="w-5 h-5 text-text-secondary" />
            </button>
            <h1 className="text-2xl font-bold text-text-primary">
              {isEdit ? 'ویرایش ویژگی' : 'ویژگی جدید'}
            </h1>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-6">
              {/* Name */}
              <div className="bg-surface rounded-card shadow-card p-6">
                <h2 className="text-lg font-bold text-text-primary mb-4">نام ویژگی</h2>
                <input
                  {...register('name')}
                  placeholder="مثال: رنگ، سایز، حافظه"
                  className="w-full px-4 py-2 bg-surface border border-border rounded-input focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {errors.name && <p className="text-sm text-error mt-2">{errors.name.message}</p>}
              </div>

              {/* Values (only for create) */}
              {!isEdit && (
                <div className="bg-surface rounded-card shadow-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-text-primary">مقادیر</h2>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => append({ value: '', color_code: '' })}
                    >
                      + افزودن مقدار
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {fields.map((field, index) => (
                      <div key={field.id} className="flex items-center gap-3">
                        <div className="flex-1">
                          <input
                            {...register(`values.${index}.value`)}
                            placeholder="مقدار (مثال: قرمز، XL، 256GB)"
                            className="w-full px-4 py-2 bg-surface border border-border rounded-input text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        <div className="w-32">
                          <input
                            {...register(`values.${index}.color_code`)}
                            placeholder="#FF0000"
                            className="w-full px-3 py-2 bg-surface border border-border rounded-input text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        <input
                          type="color"
                          {...register(`values.${index}.color_code`)}
                          className="w-10 h-10 rounded cursor-pointer border-0"
                        />
                        {fields.length > 1 && (
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="p-2 hover:bg-error-light rounded-button text-error"
                          >
                            <Icon icon="mdi:close" className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-4">
                <Button type="submit" loading={isSubmitting} size="lg">
                  {isEdit ? 'بروزرسانی' : 'ایجاد ویژگی'}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
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