// src/app/(auth)/login/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/modules/auth/store/auth.store';
import AuthPageShell from '@/modules/auth/components/AuthPageShell';
import OTPForm from '@/modules/auth/components/OTPForm';
import VerifyOTPForm from '@/modules/auth/components/VerifyOTPForm';
import { getSafeRedirectPath } from '@/lib/public-routes';

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
        const redirectPath = getSafeRedirectPath(
          new URLSearchParams(window.location.search).get('redirect')
        );
        router.push(redirectPath);
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
    <AuthPageShell
      backHref="/"
      backLabel={step === 'phone' ? 'بازگشت به خانه' : 'بازگشت'}
      onBack={step === 'verify' ? handleBack : undefined}
    >
      {step === 'phone' ? (
        <OTPForm onSuccess={handleOTPSent} />
      ) : (
        <VerifyOTPForm phoneNumber={phoneNumber} />
      )}
    </AuthPageShell>
  );
}
