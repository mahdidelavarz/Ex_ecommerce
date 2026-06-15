// src/app/(profile)/profile/sessions/page.tsx
'use client';

import Link from 'next/link';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/modules/auth/services/auth.service';
import { useProtectedRoute } from '@/modules/auth/hooks/useProtectedRoute';
import {
  LucideSmartphone,
  LucideTrash2,
  MdiShieldAccount,
  SvgSpinnersRingResize,
} from '@/components/icons/Icons';

export default function ProfileSessionsPage() {
  const { isLoading: isAuthLoading } = useProtectedRoute();
  const queryClient = useQueryClient();

  const { data: sessions, isLoading } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => authService.getSessions(),
  });

  const revokeMutation = useMutation({
    mutationFn: (id: string) => authService.revokeSession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      toast.success('نشست با موفقیت لغو شد');
    },
    onError: () => {
      toast.error('خطا در لغو نشست');
    },
  });

  if (isAuthLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <SvgSpinnersRingResize className="animate-spin text-primary" width={48} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Profile Nav */}
      <div className="flex items-center gap-6 mb-8 border-b border-border pb-4">
        <Link href="/profile" className="text-text-secondary hover:text-primary transition-colors">پروفایل</Link>
        <Link href="/profile/orders" className="text-text-secondary hover:text-primary transition-colors">سفارش‌ها</Link>
        <Link href="/profile/addresses" className="text-text-secondary hover:text-primary transition-colors">آدرس‌ها</Link>
        <Link href="/profile/sessions" className="text-primary font-medium border-b-2 border-primary pb-4 -mb-[17px]">نشست‌ها</Link>
      </div>

      <h1 className="text-2xl font-bold text-text-primary mb-8">نشست‌های فعال</h1>

      {sessions?.length === 0 ? (
        <div className="text-center py-16 bg-surface rounded-card shadow-card">
          <LucideSmartphone className="text-text-muted mx-auto mb-4" width={64} />
          <p className="text-text-secondary">نشست فعالی یافت نشد</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions?.map((session) => (
            <div key={session.id} className="bg-surface rounded-card shadow-card p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary-light rounded-full flex items-center justify-center shrink-0">
                  <LucideSmartphone className="text-primary" width={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-text-primary">
                      {session.user_agent || 'دستگاه ناشناس'}
                    </p>
                    {session.is_current && (
                      <span className="flex items-center gap-1 bg-success-light text-success text-xs px-2 py-1 rounded-full">
                        <MdiShieldAccount width={14} />
                        نشست فعلی
                      </span>
                    )}
                  </div>
                  <p className="text-text-secondary text-sm mt-1">
                    {session.ip_address || 'آی‌پی نامشخص'}
                  </p>
                  <p className="text-text-muted text-xs mt-1">
                    آخرین فعالیت: {session.last_used_at ? new Date(session.last_used_at).toLocaleString('fa-IR') : '-'}
                  </p>
                </div>
              </div>

              {!session.is_current && (
                <button
                  onClick={() => revokeMutation.mutate(session.id)}
                  disabled={revokeMutation.isPending}
                  className="p-2 hover:bg-error-light rounded-button text-error transition-colors shrink-0"
                  title="لغو نشست"
                >
                  <LucideTrash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
