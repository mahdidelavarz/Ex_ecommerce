// src/app/(admin)/admin/categories/[id]/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useAdminRoute } from '@/modules/auth/hooks/useAdminRoute';
import { categoryService } from '@/modules/categories/services/category.service';
import { useCategoryTree } from '@/modules/categories/hooks/useCategories';
import { numberField } from '@/lib/forms';
import type { CategoryTreeNode } from '@/modules/categories/types/category.types';
import AdminSidebar from '@/components/layout/AdminSidebar';
import { Button, Card, Input, Select, Textarea, Toggle } from '@/components/ui';
import { MdiArrowRight, SolarFolderWithFilesBold, SvgSpinnersRingResize } from '@/components/icons/Icons';
import { Icon } from '@iconify/react';

const iconifyPattern = /^[a-z0-9-]+:[a-z0-9-]+$/;

function flattenTree(
  nodes: CategoryTreeNode[],
  depth = 0,
): Array<{ id: string; name: string; depth: number }> {
  return nodes.flatMap((node) => [
    { id: node.id, name: node.name, depth },
    ...flattenTree(node.children ?? [], depth + 1),
  ]);
}

function collectDescendantIds(nodes: CategoryTreeNode[]): string[] {
  return nodes.flatMap((node) => [node.id, ...collectDescendantIds(node.children ?? [])]);
}

function findNode(nodes: CategoryTreeNode[], id: string): CategoryTreeNode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    const found = findNode(node.children ?? [], id);
    if (found) return found;
  }
  return null;
}

// Schema - exact match with form values (mirrors backend category.validator.ts)
const categoryFormSchema = z
  .object({
    parent_id: z.string().nullable(),
    name: z
      .string()
      .min(2, 'نام دسته‌بندی باید حداقل ۲ کاراکتر باشد')
      .max(100, 'نام دسته‌بندی نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد'),
    description: z.string().nullable(),
    image: z
      .string()
      .refine((val) => !val || z.string().url().safeParse(val).success, 'آدرس تصویر نامعتبر است')
      .nullable(),
    icon: z
      .string()
      .refine((val) => !val || iconifyPattern.test(val), 'فرمت آیکون نامعتبر است (مثال: mdi:folder)')
      .nullable(),
    color: z
      .string()
      .refine(
        (val) => !val || /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(val),
        'کد رنگ نامعتبر است',
      )
      .nullable(),
    sort_order: z.number().int().min(0).optional(),
    is_active: z.boolean(),
    seo_title: z.string().max(200, 'عنوان سئو نمی‌تواند بیشتر از ۲۰۰ کاراکتر باشد').nullable(),
    seo_description: z
      .string()
      .max(500, 'توضیحات سئو نمی‌تواند بیشتر از ۵۰۰ کاراکتر باشد')
      .nullable(),
  })
  .refine((d) => !(d.icon && d.image), {
    message: 'فقط یکی از آیکون یا تصویر مجاز است',
    path: ['icon'],
  });

type CategoryFormData = z.infer<typeof categoryFormSchema>;

export default function AdminCategoryFormPage() {
  const router = useRouter();
  const params = useParams();
  const { isLoading: isAuthLoading } = useAdminRoute();
  const isEdit = params.id !== 'new';
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mediaType, setMediaType] = useState<'icon' | 'image'>('icon');

  const { data: categoryTree } = useCategoryTree();

  const validParents = useMemo(() => {
    const flat = flattenTree(categoryTree ?? []);
    if (!isEdit) return flat;
    const currentId = params.id as string;
    const subtree = findNode(categoryTree ?? [], currentId);
    const excludeIds = new Set([currentId, ...collectDescendantIds(subtree?.children ?? [])]);
    return flat.filter((cat) => !excludeIds.has(cat.id));
  }, [categoryTree, isEdit, params.id]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      parent_id: null,
      name: '',
      description: null,
      image: null,
      icon: null,
      color: '#2563EB',
      sort_order: undefined,
      is_active: true,
      seo_title: null,
      seo_description: null,
    },
  });

  const selectedColor = watch('color');
  const selectedIcon = watch('icon');
  const selectedImage = watch('image');
  const isActive = watch('is_active');

  const handleMediaTypeChange = (type: 'icon' | 'image') => {
    setMediaType(type);
    if (type === 'icon') {
      setValue('image', null);
    } else {
      setValue('icon', null);
    }
  };

  useEffect(() => {
    if (isEdit) {
      loadCategory(params.id as string);
    }
  }, [params.id]);

  const loadCategory = async (id: string) => {
    try {
      const category = await categoryService.getBySlug(id);
      reset({
        parent_id: category.parent_id || null,
        name: category.name,
        description: category.description || null,
        image: category.image || null,
        icon: category.icon || null,
        color: category.color || '#2563EB',
        sort_order: category.sort_order,
        is_active: category.is_active,
        seo_title: category.seo?.title || null,
        seo_description: category.seo?.description || null,
      });
      setMediaType(category.image ? 'image' : 'icon');
    } catch (error) {
      toast.error('خطا در دریافت اطلاعات دسته‌بندی');
      router.push('/admin/categories');
    }
  };

  const onSubmit = async (data: CategoryFormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        parent_id: data.parent_id || null,
        image: mediaType === 'image' ? data.image || null : null,
        icon: mediaType === 'icon' ? data.icon || null : null,
        color: data.color || null,
        description: data.description || null,
        sort_order: data.sort_order ?? 0,
        seo_title: data.seo_title || null,
        seo_description: data.seo_description || null,
      };

      if (isEdit) {
        await categoryService.update(params.id as string, payload);
        toast.success('دسته‌بندی با موفقیت بروزرسانی شد');
      } else {
        await categoryService.create(payload);
        toast.success('دسته‌بندی با موفقیت ایجاد شد');
      }
      router.push('/admin/categories');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'خطا در ذخیره دسته‌بندی');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <SvgSpinnersRingResize className=" text-primary" width={48} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      
      <main className="flex-1 lg:mr-64 p-4 lg:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-surface-raised rounded-button transition-colors"
            >
              <MdiArrowRight className="w-5 h-5 text-text-secondary" />
            </button>
            <h1 className="text-2xl font-bold text-text-primary">
              {isEdit ? 'ویرایش دسته‌بندی' : 'دسته‌بندی جدید'}
            </h1>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-6">
              {/* Basic Info */}
              <Card className="p-6">
                <h2 className="text-lg font-bold text-text-primary mb-6">اطلاعات پایه</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <Input
                    label="نام دسته‌بندی *"
                    type="text"
                    wrapperClassName="md:col-span-2"
                    {...register('name')}
                    error={errors.name?.message}
                  />

                  {/* Parent */}
                  <Select label="والد" {...register('parent_id')}>
                    <option value="">بدون والد (دسته اصلی)</option>
                    {validParents.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {'—'.repeat(cat.depth)} {cat.name}
                      </option>
                    ))}
                  </Select>

                  {/* Sort Order */}
                  <Input
                    label="ترتیب نمایش"
                    type="number"
                    {...register('sort_order', numberField)}
                    error={errors.sort_order?.message}
                  />

                  {/* Active */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-text-secondary">وضعیت</label>
                    <Toggle
                      label={isActive ? 'فعال' : 'غیرفعال'}
                      checked={isActive}
                      onChange={(e) => setValue('is_active', e.target.checked)}
                    />
                  </div>

                  {/* Description */}
                  <Textarea
                    label="توضیحات"
                    wrapperClassName="md:col-span-2"
                    {...register('description')}
                    error={errors.description?.message}
                    rows={4}
                  />
                </div>
              </Card>

              {/* Appearance */}
              <Card className="p-6">
                <h2 className="text-lg font-bold text-text-primary mb-6">ظاهر</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Color */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-text-secondary">
                      رنگ
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={selectedColor || '#000000'}
                        onChange={(e) => setValue('color', e.target.value)}
                        className="w-12 h-12 rounded-lg cursor-pointer border-0"
                      />
                      <Input
                        wrapperClassName="flex-1"
                        type="text"
                        {...register('color')}
                        error={errors.color?.message}
                      />
                    </div>
                  </div>

                  {/* Media type selector: icon OR image */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-text-secondary">
                      نوع نمایش
                    </label>
                    <div className="flex rounded-button border border-border overflow-hidden w-fit">
                      <button
                        type="button"
                        onClick={() => handleMediaTypeChange('icon')}
                        className={`px-4 py-2 text-sm transition-colors ${
                          mediaType === 'icon'
                            ? 'bg-primary text-white'
                            : 'bg-surface-raised text-text-secondary hover:bg-surface'
                        }`}
                      >
                        آیکون
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMediaTypeChange('image')}
                        className={`px-4 py-2 text-sm transition-colors ${
                          mediaType === 'image'
                            ? 'bg-primary text-white'
                            : 'bg-surface-raised text-text-secondary hover:bg-surface'
                        }`}
                      >
                        تصویر
                      </button>
                    </div>
                  </div>

                  {/* Conditional field: Icon */}
                  {mediaType === 'icon' && (
                    <div className="space-y-2 md:col-span-2">
                      <Input
                        label="آیکون (Iconify)"
                        type="text"
                        dir="ltr"
                        {...register('icon')}
                        placeholder="mdi:folder"
                        trailingIcon={selectedIcon ? (() => <Icon icon={selectedIcon} width={20} />) : undefined}
                        error={errors.icon?.message}
                      />
                      <p className="text-xs text-text-muted">
                        آیکون‌ها از{' '}
                        <a
                          href="https://icon-sets.iconify.design"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Iconify
                        </a>
                      </p>
                    </div>
                  )}

                  {/* Conditional field: Image URL */}
                  {mediaType === 'image' && (
                    <Input
                      label="آدرس تصویر"
                      type="text"
                      dir="ltr"
                      wrapperClassName="md:col-span-2"
                      {...register('image')}
                      placeholder="https://..."
                      error={errors.image?.message}
                    />
                  )}

                  {/* Preview */}
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium text-text-secondary mb-3">پیش‌نمایش</p>
                    <div className="flex items-center gap-3 p-4 bg-surface-raised rounded-card">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden"
                        style={{ backgroundColor: selectedColor || '#ccc' }}
                      >
                        {mediaType === 'image' && selectedImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={selectedImage} alt="" className="w-full h-full object-cover" />
                        ) : selectedIcon ? (
                          <Icon icon={selectedIcon} className="w-6 h-6 text-white" />
                        ) : (
                          <SolarFolderWithFilesBold className="w-6 h-6 text-white" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-text-primary">
                          {watch('name') || 'نام دسته‌بندی'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* SEO */}
              <Card className="p-6">
                <h2 className="text-lg font-bold text-text-primary mb-6">سئو</h2>
                <div className="grid grid-cols-1 gap-6">
                  <Input
                    label="عنوان سئو"
                    type="text"
                    {...register('seo_title')}
                    error={errors.seo_title?.message}
                  />
                  <Textarea
                    label="توضیحات سئو"
                    {...register('seo_description')}
                    error={errors.seo_description?.message}
                    rows={3}
                  />
                </div>
              </Card>

              {/* Actions */}
              <div className="flex items-center gap-4">
                <Button
                  type="submit"
                  loading={isSubmitting}
                  size="lg"
                >
                  {isEdit ? 'بروزرسانی' : 'ایجاد'}
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