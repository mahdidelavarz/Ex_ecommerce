// src/app/(auth)/profile/page.tsx
"use client";

import { ComponentType, SVGProps, useState } from "react";
import { useProtectedRoute } from "@/modules/auth/hooks/useProtectedRoute";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import CompleteProfileForm from "@/modules/auth/components/CompleteProfileForm";
import EditProfileForm from "@/modules/auth/components/EditProfileForm";
import { formatDate } from "@/utils/formatDate";
import {
  LucideLogOut,
  LucidePencil,
  MdiAccount,
  MdiAccountCircle,
  MdiAccountEdit,
  MdiCake,
  MdiCalendar,
  MdiEmail,
  MdiPhone,
  MdiShieldAccount,
  SvgSpinnersRingResize,
} from "@/components/icons/Icons";

export default function ProfilePage() {
  const { user, isLoading } = useProtectedRoute();
  const { logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <SvgSpinnersRingResize
            className=" text-primary mx-auto mb-4"
            width={48}
          />
          <p className="text-text-secondary">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  // Show complete profile form if profile is incomplete
  if (!user?.profile_completed) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-surface rounded-2xl shadow-card p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-4">
                <MdiAccountEdit className="text-primary" width={32} />
              </div>
              <h1 className="text-2xl font-bold text-text-primary mb-2">
                تکمیل اطلاعات
              </h1>
              <p className="text-text-secondary">
                لطفاً اطلاعات خود را تکمیل کنید
              </p>
            </div>
            <CompleteProfileForm />
          </div>
        </div>
      </div>
    );
  }

  // Show profile details if profile is complete
  if (isEditing && user) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-surface rounded-2xl shadow-card p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-4">
                <MdiAccountEdit className="text-primary" width={32} />
              </div>
              <h1 className="text-2xl font-bold text-text-primary mb-2">
                ویرایش پروفایل
              </h1>
            </div>
            <EditProfileForm
              user={user}
              onCancel={() => setIsEditing(false)}
              onSuccess={() => setIsEditing(false)}
            />
          </div>
        </div>
      </div>
    );
  }

  // Show profile view
  return (
    <main className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-surface rounded-2xl shadow-card overflow-hidden">
          {/* Header */}
          <div className="bg-primary px-8 py-12">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                  <MdiAccountCircle className="text-primary" width={48} />
                </div>
                <div className="text-white">
                  <h1 className="text-3xl font-bold">{user.full_name}</h1>
                  <p className="text-primary-light">{user.phone_number}</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 bg-white text-primary px-4 py-2 rounded-button hover:bg-primary-light transition-colors font-medium"
              >
                <LucidePencil width={20} />
                ویرایش
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <h2 className="text-xl font-bold text-text-primary mb-6">
              اطلاعات حساب کاربری
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoCard
                icon={MdiAccount}
                label="نام کامل"
                value={user.full_name}
              />
              <InfoCard
                icon={MdiPhone}
                label="شماره موبایل"
                value={user.phone_number || ""}
              />
              {user.email && (
                <InfoCard icon={MdiEmail} label="ایمیل" value={user.email} />
              )}
              {user.birthday && (
                <InfoCard
                  icon={MdiCake}
                  label="تاریخ تولد"
                  value={formatDate(user.birthday)}
                />
              )}
              <InfoCard
                icon={MdiShieldAccount}
                label="نقش کاربری"
                value={user.role === "admin" ? "مدیر" : "کاربر"}
              />
              <InfoCard
                icon={MdiCalendar}
                label="تاریخ عضویت"
                value={formatDate(user.created_at)}
              />
            </div>

            {/* Logout Button */}
            <div className="mt-8 pt-8 border-t border-border">
              <button
                onClick={logout}
                className="flex items-center gap-2 text-error hover:text-red-700 transition-colors font-medium"
              >
                <LucideLogOut width={20} />
                خروج از حساب کاربری
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

// Helper component
function InfoCard({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-surface-raised rounded-card p-4">
      <div className="flex items-start gap-3">
        <Icon className="text-text-secondary mt-1" width={24} />
        <div>
          <p className="text-sm text-text-muted mb-1">{label}</p>
          <p className="font-medium text-text-primary">{value}</p>
        </div>
      </div>
    </div>
  );
}
