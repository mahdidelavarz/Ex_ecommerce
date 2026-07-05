// src/app/(auth)/login/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/modules/auth/store/auth.store';
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
    <section className="relative h-dvh overflow-hidden bg-background">
      <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary-light/80 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -left-20 h-80 w-80 rounded-full bg-secondary-light/80 blur-3xl" />

      <Link
        href="/"
        className="absolute right-4 top-4 z-10 inline-flex items-center rounded-button border border-border bg-surface/80 px-4 py-2 text-sm font-medium text-text-secondary shadow-card backdrop-blur-md transition-colors hover:text-text-primary sm:right-6 sm:top-6"
      >
        Back to home
      </Link>

      <div className="relative mx-auto flex h-full max-w-6xl items-center justify-center px-4 py-4 sm:px-6 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(22rem,28rem)] lg:gap-12">
        <div className="hidden lg:block">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/50 bg-surface/55 p-10 shadow-card backdrop-blur-xl">
            <div className="absolute -top-20 -left-16 h-48 w-48 rounded-full bg-primary/10" />
            <div className="absolute -bottom-24 -right-16 h-56 w-56 rounded-full bg-secondary/15" />
            <div className="relative space-y-6">
              <div className="h-2 w-24 rounded-full bg-primary/30" />
              <div className="space-y-3">
                <div className="h-4 w-3/4 rounded-full bg-text-muted/20" />
                <div className="h-4 w-2/3 rounded-full bg-text-muted/20" />
                <div className="h-4 w-1/2 rounded-full bg-text-muted/20" />
              </div>
              <div className="grid grid-cols-2 gap-4 pt-8">
                <div className="h-28 rounded-2xl bg-white/45 shadow-soft" />
                <div className="h-28 rounded-2xl bg-primary-light/70 shadow-soft" />
              </div>
            </div>
          </div>
        </div>

        <div className="w-full max-w-md">
        {step === 'phone' ? (
          <OTPForm onSuccess={handleOTPSent} />
        ) : (
          <VerifyOTPForm phoneNumber={phoneNumber} onBack={handleBack} />
        )}
      </div>
      </div>
    </section>
  );
}
