// src/app/(admin)/admin/attributes/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useAdminRoute } from '@/modules/auth/hooks/useAdminRoute';

import AdminFormLayout from '@/components/layout/AdminFormLayout';
import { Button, FormSection, Input, Select } from '@/components/ui';
import { attributeService } from '@/modules/attributes/services/attribute.service';
import {
  useCreateAttribute,
  useUpdateAttribute,
  useDeleteAttributeValue,
} from '@/modules/attributes/hooks/useAttributes';
import { MdiClose, MdiInformation, MdiTagMultiple, LucidePlus } from '@/components/icons/Icons';
import type { AttributeValue } from '@/modules/attributes/types/attribute.types';

const valueSchema = z.object({
  value: z.string().min(1, 'مقدار الزامی است').max(100),
  color_code: z.string().regex(/^#([A-Fa-f0-9]{6})$/, 'کد رنگ نامعتبر').optional().or(z.literal('')),
});

const attributeFormSchema = z.object({
  name: z.string().min(1, 'نام ویژگی الزامی است').max(100),
  type: z.enum(['color', 'size', 'text']),
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

  const watchedName = watch('name');

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

  return (
    <AdminFormLayout
      title={isEdit ? 'ویرایش ویژگی' : 'ویژگی جدید'}
      subtitle={isEdit ? watchedName || undefined : 'افزودن ویژگی جدید برای محصولات'}
      loading={isAuthLoading}
      onBack={() => router.back()}
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={isSubmitting}
      submitLabel={isEdit ? 'بروزرسانی' : 'ایجاد ویژگی'}
      maxWidth="3xl"
    >
      {/* Basic info */}
      <FormSection title="اطلاعات پایه" icon={MdiInformation} columns={2}>
        <Input
          label="نام ویژگی *"
          {...register('name')}
          placeholder="مثال: رنگ، سایز، حافظه"
          error={errors.name?.message}
        />
        <Select
          label="نوع ویژگی"
          {...register('type')}
          options={[
            { value: 'text', label: 'متن' },
            { value: 'size', label: 'سایز' },
            { value: 'color', label: 'رنگ' },
          ]}
        />
      </FormSection>

      {/* Values */}
      <FormSection
        title="مقادیر"
        description="گزینه‌های قابل انتخاب این ویژگی (مثل قرمز، آبی، XL)"
        icon={MdiTagMultiple}
      >
        <div className="flex justify-end">
          <Button
            type="button"
            size="sm"
            variant="outline"
            icon={LucidePlus}
            onClick={() => append({ value: '', color_code: '' })}
          >
            افزودن مقدار
          </Button>
        </div>

        {/* Existing values (edit mode only) */}
        {isEdit && existingValues.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-text-secondary">مقادیر موجود:</p>
            {existingValues.map((val) => (
              <div
                key={val.id}
                className="flex items-center gap-3 px-3 py-2 bg-surface-raised rounded-input"
              >
                {val.color_code && (
                  <div
                    className="w-6 h-6 rounded-full border border-border shrink-0"
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
                  className="p-1 hover:bg-error-light rounded text-error disabled:opacity-50 cursor-pointer"
                >
                  <MdiClose className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* New values form rows */}
        {isEdit && <p className="text-sm text-text-secondary">مقادیر جدید برای افزودن:</p>}
        <div className="space-y-3">
          {fields.map((field, index) => {
            const colorCode = watch(`values.${index}.color_code`);
            return (
              <div key={field.id} className="flex items-center gap-3">
                <Input
                  wrapperClassName="flex-1"
                  {...register(`values.${index}.value`)}
                  placeholder="مقدار (مثال: قرمز، XL، 256GB)"
                  className="text-sm"
                />
                <Input
                  wrapperClassName="w-32"
                  dir="ltr"
                  {...register(`values.${index}.color_code`)}
                  placeholder="#FF0000"
                  className="text-sm"
                />
                <input
                  type="color"
                  value={colorCode || '#000000'}
                  onChange={(e) => setValue(`values.${index}.color_code`, e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer border-0 shrink-0"
                  aria-label="انتخاب رنگ"
                />
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="p-2 hover:bg-error-light rounded-button text-error cursor-pointer"
                  >
                    <MdiClose className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </FormSection>
    </AdminFormLayout>
  );
}
