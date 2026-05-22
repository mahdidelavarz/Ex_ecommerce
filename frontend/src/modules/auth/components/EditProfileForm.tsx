// src/modules/auth/components/EditProfileForm.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Icon } from '@iconify/react';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../store/auth.store';
import type { AuthUser } from '../types/auth.type';

const editProfileSchema = z.object({
  full_name: z
    .string()
    .min(2, 'نام کامل باید حداقل ۲ کاراکتر باشد')
    .max(100, 'نام کامل نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد'),
  email: z
    .string()
    .email('ایمیل نامعتبر است')
    .optional()
    .or(z.literal('')),
  birthday: z.string().optional(),
});

type EditProfileFormData = z.infer<typeof editProfileSchema>;

interface EditProfileFormProps {
  user: AuthUser;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function EditProfileForm({
  user,
  onCancel,
  onSuccess,
}: EditProfileFormProps) {
  const { updateUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditProfileFormData>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      full_name: user.full_name || '',
      email: user.email || '',
      birthday: user.birthday
        ? new Date(user.birthday).toISOString().split('T')[0]
        : '',
    },
  });

  const onSubmit = async (data: EditProfileFormData) => {
    setIsLoading(true);
    try {
      const updatedUser = await authService.updateProfile({
        full_name: data.full_name,
        email: data.email || null,
        birthday: data.birthday || null,
      });

      updateUser(updatedUser);
      toast.success('پروفایل با موفقیت بروزرسانی شد');
      onSuccess();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'خطا در بروزرسانی پروفایل';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Full Name */}
      <div className="space-y-2">
        <label
          htmlFor="full_name"
          className="block text-sm font-medium text-text-secondary"
        >
          نام کامل *
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <Icon icon="mdi:account" className="w-5 h-5 text-text-muted" />
          </div>
          <input
            id="full_name"
            type="text"
            {...register('full_name')}
            disabled={isLoading}
            className={`
              w-full pr-10 pl-4 py-3 bg-surface border rounded-input
              text-text-primary
              transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
              disabled:opacity-50 disabled:cursor-not-allowed
              ${errors.full_name ? 'border-error' : 'border-border'}
            `}
          />
        </div>
        {errors.full_name && (
          <p className="text-sm text-error flex items-center gap-1">
            <Icon icon="mdi:alert-circle" className="w-4 h-4" />
            {errors.full_name.message}
          </p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-2">
        <label
          htmlFor="email"
          className="block text-sm font-medium text-text-secondary"
        >
          ایمیل (اختیاری)
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <Icon icon="mdi:email" className="w-5 h-5 text-text-muted" />
          </div>
          <input
            id="email"
            type="email"
            {...register('email')}
            disabled={isLoading}
            dir="ltr"
            className={`
              w-full pr-10 pl-4 py-3 bg-surface border rounded-input
              text-text-primary
              transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
              disabled:opacity-50 disabled:cursor-not-allowed
              ${errors.email ? 'border-error' : 'border-border'}
            `}
          />
        </div>
        {errors.email && (
          <p className="text-sm text-error flex items-center gap-1">
            <Icon icon="mdi:alert-circle" className="w-4 h-4" />
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Birthday */}
      <div className="space-y-2">
        <label
          htmlFor="birthday"
          className="block text-sm font-medium text-text-secondary"
        >
          تاریخ تولد (اختیاری)
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <Icon icon="mdi:cake" className="w-5 h-5 text-text-muted" />
          </div>
          <input
            id="birthday"
            type="date"
            {...register('birthday')}
            disabled={isLoading}
            className="
              w-full pr-10 pl-4 py-3 bg-surface border rounded-input
              text-text-primary
              transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
              disabled:opacity-50 disabled:cursor-not-allowed
              border-border
            "
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1"
        >
          انصراف
        </Button>
        <Button type="submit" loading={isLoading} className="flex-1">
          ذخیره تغییرات
        </Button>
      </div>
    </form>
  );
}