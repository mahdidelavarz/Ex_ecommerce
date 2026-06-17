// src/app/(admin)/admin/attributes/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useAdminRoute } from '@/modules/auth/hooks/useAdminRoute';

import AdminSidebar from '@/components/layout/AdminSidebar';
import Button from '@/components/ui/Button';
import { attributeService } from '@/modules/attributes/services/attribute.service';
import {
  useCreateAttribute,
  useUpdateAttribute,
  useDeleteAttributeValue,
} from '@/modules/attributes/hooks/useAttributes';
import { MdiArrowRight, MdiClose, SvgSpinnersRingResize } from '@/components/icons/Icons';
import type { AttributeValue } from '@/modules/attributes/types/attribute.types';

const valueSchema = z.object({
  value: z.string().min(1, 'مقدار الزامی است').max(100),
  color_code: z.string().regex(/^#([A-Fa-f0-9]{6})$/, 'کد رنگ نامعتبر').optional().or(z.literal('')),
});

const attributeFormSchema = z.object({
  name: z.string().min(1, 'نام ویژگی الزامی است').max(100),
  type: z.enum(['color', 'size', 'text']).default('text'),
  values: z.array(valueSchema).optional(),
});

type AttributeFormData = z.infer<typeof attributeFormSchema>;

export default function AdminAttributeFormPage() {
  const router = useRouter();
  const params = useParams();
  const isEdit = params.id !== 'new';
  const { isLoading: isAuthLoading } = useAdminRoute();
  const [existingValues, setExistingValues] = useState<AttributeValue[]>([]);

  const createMutation = useCreateAttribute();
  const updateMutation = useUpdateAttribute();
  const deleteValueMutation = useDeleteAttributeValue();

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AttributeFormData>({
    resolver: zodResolver(attributeFormSchema),
    defaultValues: {
      name: '',
      type: 'text',
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
        type: (attr as any).type || 'text',
        values: [{ value: '', color_code: '' }],
      });
      setExistingValues(attr.values || []);
    } catch {
      toast.error('خطا در دریافت اطلاعات');
      router.push('/admin/attributes');
    }
  };

  const handleDeleteValue = (valueId: string) => {
    deleteValueMutation.mutate(valueId, {
      onSuccess: () => setExistingValues((prev) => prev.filter((v) => v.id !== valueId)),
    });
  };

  const onSubmit = async (data: AttributeFormData) => {
    const newValues = data.values
      ?.filter((v) => v.value.trim())
      .map((v) => ({ value: v.value, color_code: v.color_code || undefined }));

    if (isEdit) {
      updateMutation.mutate(
        { id: params.id as string, data: { name: data.name, type: data.type } },
        {
          onSuccess: async () => {
            try {
              if (newValues?.length) {
                for (const v of newValues) {
                  await attributeService.addValue(params.id as string, v);
                }
              }
              toast.success('ویژگی بروزرسانی شد');
              router.push('/admin/attributes');
            } catch (e: any) {
              toast.error(e.response?.data?.message || 'خطا در افزودن مقادیر');
            }
          },
        }
      );
    } else {
      createMutation.mutate(
        { name: data.name, type: data.type, values: newValues?.length ? newValues : undefined },
        { onSuccess: () => router.push('/admin/attributes') }
      );
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

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
          <div className="flex items-center gap-4 mb-8">
            <button onClick={() => router.back()} className="p-2 hover:bg-surface-raised rounded-button">
              <MdiArrowRight className="w-5 h-5 text-text-secondary" />
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

              {/* Type */}
              <div className="bg-surface rounded-card shadow-card p-6">
                <h2 className="text-lg font-bold text-text-primary mb-4">نوع ویژگی</h2>
                <select
                  {...register('type')}
                  className="w-full px-4 py-2 bg-surface border border-border rounded-input focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="text">متن</option>
                  <option value="size">سایز</option>
                  <option value="color">رنگ</option>
                </select>
              </div>

              {/* Values */}
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

                {/* Existing values (edit mode only) */}
                {isEdit && existingValues.length > 0 && (
                  <div className="mb-5 space-y-2">
                    <p className="text-sm text-text-secondary mb-2">مقادیر موجود:</p>
                    {existingValues.map((val) => (
                      <div
                        key={val.id}
                        className="flex items-center gap-3 px-3 py-2 bg-surface-raised rounded-input"
                      >
                        {val.color_code && (
                          <div
                            className="w-6 h-6 rounded-full border border-border flex-shrink-0"
                            style={{ backgroundColor: val.color_code }}
                          />
                        )}
                        <span className="flex-1 text-sm">{val.value}</span>
                        {val.color_code && (
                          <span className="text-xs font-mono text-text-secondary">{val.color_code}</span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteValue(val.id)}
                          disabled={deleteValueMutation.isPending}
                          className="p-1 hover:bg-error-light rounded text-error disabled:opacity-50"
                        >
                          <MdiClose className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* New values form rows */}
                {isEdit && (
                  <p className="text-sm text-text-secondary mb-2">مقادیر جدید برای افزودن:</p>
                )}
                <div className="space-y-3">
                  {fields.map((field, index) => {
                    const colorCode = watch(`values.${index}.color_code`);
                    return (
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
                          value={colorCode || '#000000'}
                          onChange={(e) => setValue(`values.${index}.color_code`, e.target.value)}
                          className="w-10 h-10 rounded cursor-pointer border-0"
                        />
                        {fields.length > 1 && (
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="p-2 hover:bg-error-light rounded-button text-error"
                          >
                            <MdiClose className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <Button type="submit" loading={isSubmitting} size="lg">
                  {isEdit ? 'بروزرسانی' : 'ایجاد ویژگی'}
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
