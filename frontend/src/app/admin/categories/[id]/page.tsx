// src/app/(admin)/admin/categories/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Icon } from '@iconify/react';
import toast from 'react-hot-toast';
import { useAdminRoute } from '@/modules/auth/hooks/useAdminRoute';
import { categoryService } from '@/modules/categories/services/category.service';
import { useCategories } from '@/modules/categories/hooks/useCategories';
import AdminSidebar from '@/components/layout/AdminSidebar';
import Button from '@/components/ui/Button';

// Schema - exact match with form values
const categoryFormSchema = z.object({
  parent_id: z.string().nullable(),
  name: z.string().min(2, 'نام الزامی است').max(100),
  description: z.string().nullable(),
  image: z.string().nullable(),
  icon: z.string().nullable(),
  color: z.string().nullable(),
  sort_order: z.number().min(0),
  is_active: z.boolean(),
  seo_title: z.string().nullable(),
  seo_description: z.string().nullable(),
});

type CategoryFormData = z.infer<typeof categoryFormSchema>;

export default function AdminCategoryFormPage() {
  const router = useRouter();
  const params = useParams();
  const { isLoading: isAuthLoading } = useAdminRoute();
  const isEdit = params.id !== 'new';
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: categoriesData } = useCategories({ limit: 100 });

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
      sort_order: 0,
      is_active: true,
      seo_title: null,
      seo_description: null,
    },
  });

  const selectedColor = watch('color');
  const selectedIcon = watch('icon');
  const isActive = watch('is_active');

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
        image: data.image || null,
        icon: data.icon || null,
        color: data.color || null,
        description: data.description || null,
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
        <Icon icon="mdi:loading" className="animate-spin text-primary" width={48} />
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
              <Icon icon="mdi:arrow-right" className="w-5 h-5 text-text-secondary" />
            </button>
            <h1 className="text-2xl font-bold text-text-primary">
              {isEdit ? 'ویرایش دسته‌بندی' : 'دسته‌بندی جدید'}
            </h1>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="bg-surface rounded-card shadow-card p-6">
                <h2 className="text-lg font-bold text-text-primary mb-6">اطلاعات پایه</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="block text-sm font-medium text-text-secondary">
                      نام دسته‌بندی *
                    </label>
                    <input
                      type="text"
                      {...register('name')}
                      className="w-full px-4 py-2 bg-surface border border-border rounded-input text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    {errors.name && (
                      <p className="text-sm text-error">{errors.name.message}</p>
                    )}
                  </div>

                  {/* Parent */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-text-secondary">
                      والد
                    </label>
                    <select
                      {...register('parent_id')}
                      className="w-full px-4 py-2 bg-surface border border-border rounded-input text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">بدون والد (دسته اصلی)</option>
                      {categoriesData?.data?.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sort Order */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-text-secondary">
                      ترتیب نمایش
                    </label>
                    <input
                      type="number"
                      {...register('sort_order', { valueAsNumber: true })}
                      className="w-full px-4 py-2 bg-surface border border-border rounded-input text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  {/* Active */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-text-secondary">
                      وضعیت
                    </label>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) => setValue('is_active', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-border rounded-full peer peer-checked:bg-success peer-checked:after:translate-x-5 rtl:peer-checked:after:-translate-x-5 after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" />
                      <span className="mr-3 text-sm text-text-secondary">
                        {isActive ? 'فعال' : 'غیرفعال'}
                      </span>
                    </label>
                  </div>

                  {/* Description */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="block text-sm font-medium text-text-secondary">
                      توضیحات
                    </label>
                    <textarea
                      {...register('description')}
                      rows={4}
                      className="w-full px-4 py-2 bg-surface border border-border rounded-input text-text-primary focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Appearance */}
              <div className="bg-surface rounded-card shadow-card p-6">
                <h2 className="text-lg font-bold text-text-primary mb-6">ظاهر</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                      <input
                        type="text"
                        {...register('color')}
                        className="flex-1 px-4 py-2 bg-surface border border-border rounded-input text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  {/* Icon */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-text-secondary">
                      آیکون (Iconify)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        {...register('icon')}
                        placeholder="mdi:folder"
                        className="w-full pl-10 px-4 py-2 bg-surface border border-border rounded-input text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      {selectedIcon && (
                        <Icon
                          icon={selectedIcon}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
                          width={20}
                        />
                      )}
                    </div>
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

                  {/* Image URL */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-text-secondary">
                      آدرس تصویر
                    </label>
                    <input
                      type="text"
                      {...register('image')}
                      placeholder="https://..."
                      className="w-full px-4 py-2 bg-surface border border-border rounded-input text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  {/* Preview */}
                  <div className="md:col-span-3">
                    <p className="text-sm font-medium text-text-secondary mb-3">پیش‌نمایش</p>
                    <div className="flex items-center gap-3 p-4 bg-surface-raised rounded-card">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: selectedColor || '#ccc' }}
                      >
                        {selectedIcon ? (
                          <Icon icon={selectedIcon} className="w-6 h-6 text-white" />
                        ) : (
                          <Icon icon="mdi:folder" className="w-6 h-6 text-white" />
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
              </div>

              {/* SEO */}
              <div className="bg-surface rounded-card shadow-card p-6">
                <h2 className="text-lg font-bold text-text-primary mb-6">سئو</h2>
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-text-secondary">
                      عنوان سئو
                    </label>
                    <input
                      type="text"
                      {...register('seo_title')}
                      className="w-full px-4 py-2 bg-surface border border-border rounded-input text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-text-secondary">
                      توضیحات سئو
                    </label>
                    <textarea
                      {...register('seo_description')}
                      rows={3}
                      className="w-full px-4 py-2 bg-surface border border-border rounded-input text-text-primary focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    />
                  </div>
                </div>
              </div>

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