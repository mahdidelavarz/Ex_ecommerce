// src/modules/auth/components/OTPForm.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Icon } from '@iconify/react';
import toast from 'react-hot-toast';
import PhoneInput from '@/components/ui/PhoneInput';
import Button from '@/components/ui/Button';
import { authService } from '../services/auth.service';

const phoneSchema = z.object({
  phone_number: z
    .string()
    .regex(/^09[0-9]{9}$/, 'شماره موبایل باید ۱۱ رقمی و با ۰۹ شروع شود'),
});

type PhoneFormData = z.infer<typeof phoneSchema>;

interface OTPFormProps {
  onSuccess: (phone: string) => void;
}

export default function OTPForm({ onSuccess }: OTPFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone_number: '' },
  });

  const phoneNumber = watch('phone_number');

  const onSubmit = async (data: PhoneFormData) => {
    setIsLoading(true);
    try {
      const response = await authService.sendOtp(data.phone_number);

      // In dev mode, auto-fill OTP from response
      if (response.otpCode) {
        toast.success(`کد تایید: ${response.otpCode}`, { duration: 5000 });
      } else {
        toast.success(response.message);
      }

      onSuccess(data.phone_number);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'خطا در ارسال کد تایید';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-surface rounded-2xl shadow-card p-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon icon="mdi:login" className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">
          ورود | ثبت‌نام
        </h1>
        <p className="text-text-secondary">
          لطفاً شماره موبایل خود را وارد کنید
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <PhoneInput
          value={phoneNumber}
          onChange={(value) => setValue('phone_number', value, { shouldValidate: true })}
          error={errors.phone_number?.message}
          disabled={isLoading}
          autoFocus
        />

        <Button
          type="submit"
          loading={isLoading}
          className="w-full"
          size="lg"
        >
          دریافت کد تایید
        </Button>
      </form>

      <p className="text-text-muted text-sm text-center mt-6">
        با ورود به سایت، قوانین و شرایط استفاده را می‌پذیرید
      </p>
    </div>
  );
}