// src/app/(auth)/login/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/modules/auth/store/auth.store';
import OTPForm from '@/modules/auth/components/OTPForm';
import VerifyOTPForm from '@/modules/auth/components/VerifyOTPForm';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [step, setStep] = useState<'phone' | 'verify'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (!user.profile_completed) {
        router.push('/profile');
      } else {
        router.push('/');
      }
    }
  }, [isAuthenticated, user, router]);

  const handleOTPSent = (phone: string) => {
    setPhoneNumber(phone);
    setStep('verify');
  };

  const handleBack = () => {
    setStep('phone');
    setPhoneNumber('');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {step === 'phone' ? (
          <OTPForm onSuccess={handleOTPSent} />
        ) : (
          <VerifyOTPForm phoneNumber={phoneNumber} onBack={handleBack} />
        )}
      </div>
    </div>
  );
}