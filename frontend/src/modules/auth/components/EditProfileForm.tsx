// src/modules/auth/components/EditProfileForm.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Button, Input } from '@/components/ui';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../store/auth.store';
import type { AuthUser } from '../types/auth.type';
import { MdiAccount, MdiCake, MdiEmail } from '@/components/icons/Icons';

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
      <Input
        label="نام کامل *"
        type="text"
        icon={MdiAccount}
        {...register('full_name')}
        disabled={isLoading}
        error={errors.full_name?.message}
      />

      {/* Email */}
      <Input
        label="ایمیل (اختیاری)"
        type="email"
        dir="ltr"
        icon={MdiEmail}
        {...register('email')}
        disabled={isLoading}
        error={errors.email?.message}
      />

      {/* Birthday */}
      <Input
        label="تاریخ تولد (اختیاری)"
        type="date"
        icon={MdiCake}
        {...register('birthday')}
        disabled={isLoading}
      />

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