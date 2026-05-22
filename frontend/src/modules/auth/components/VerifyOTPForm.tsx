// src/modules/auth/components/VerifyOTPForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import toast from 'react-hot-toast';
import OtpInput from '@/components/ui/OtpInput';
import Button from '@/components/ui/Button';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../store/auth.store';

interface VerifyOTPFormProps {
  phoneNumber: string;
  onBack: () => void;
}

export default function VerifyOTPForm({ phoneNumber, onBack }: VerifyOTPFormProps) {
  const router = useRouter();
  const { login } = useAuthStore();
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(120);

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = async () => {
    if (otp.length !== 4) {
      toast.error('لطفاً کد ۴ رقمی را وارد کنید');
      return;
    }

    setIsLoading(true);
    try {
      const result = await authService.verifyOtp(phoneNumber, otp);

      // Save to store
      login(result.user, result.refreshToken);

      toast.success('خوش آمدید!');

      // Redirect based on profile status
      if (result.requiresProfileCompletion) {
        router.push('/profile');
      } else {
        router.push('/');
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'کد تایید نامعتبر است';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await authService.sendOtp(phoneNumber);
      setTimer(120);
      toast.success('کد تایید مجدداً ارسال شد');
    } catch (error: unknown) {
      toast.error('خطا در ارسال مجدد کد');
    }
  };

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-surface rounded-2xl shadow-card p-8">
      <button
        onClick={onBack}
        disabled={isLoading}
        className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors mb-6"
      >
        <Icon icon="mdi:arrow-right" className="w-5 h-5" />
        بازگشت
      </button>

      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon icon="mdi:shield-check" className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">
          کد تایید
        </h1>
        <p className="text-text-secondary">
          کد ۴ رقمی ارسال شده به <strong>{phoneNumber}</strong> را وارد کنید
        </p>
      </div>

      <div className="space-y-6">
        <OtpInput
          length={4}
          value={otp}
          onChange={setOtp}
          disabled={isLoading}
        />

        <Button
          onClick={handleVerify}
          loading={isLoading}
          className="w-full"
          size="lg"
          disabled={otp.length !== 4}
        >
          تایید کد
        </Button>
      </div>

      <div className="text-center mt-6">
        {timer > 0 ? (
          <p className="text-text-muted">
            ارسال مجدد کد تا{' '}
            <span className="text-text-secondary font-medium">
              {formatTime(timer)}
            </span>
          </p>
        ) : (
          <button
            onClick={handleResend}
            className="text-primary hover:text-primary-hover font-medium transition-colors"
          >
            ارسال مجدد کد
          </button>
        )}
      </div>
    </div>
  );
}