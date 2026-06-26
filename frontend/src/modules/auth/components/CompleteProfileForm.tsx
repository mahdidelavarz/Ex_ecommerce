// src/modules/auth/components/CompleteProfileForm.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button, Input } from "@/components/ui";
import { authService } from "../services/auth.service";
import { useAuthStore } from "../store/auth.store";
import {
  MdiAccount,
  MdiCake,
  MdiEmail,
} from "@/components/icons/Icons";

const completeProfileSchema = z.object({
  full_name: z
    .string()
    .min(2, "نام کامل باید حداقل ۲ کاراکتر باشد")
    .max(100, "نام کامل نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد"),
  email: z.string().email("ایمیل نامعتبر است").optional().or(z.literal("")),
  birthday: z.string().optional(),
});

type CompleteProfileFormData = z.infer<typeof completeProfileSchema>;

export default function CompleteProfileForm() {
  const router = useRouter();
  const { updateUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CompleteProfileFormData>({
    resolver: zodResolver(completeProfileSchema),
  });

  const onSubmit = async (data: CompleteProfileFormData) => {
    setIsLoading(true);
    try {
      const user = await authService.completeProfile({
        full_name: data.full_name,
        email: data.email || null,
        birthday: data.birthday || null,
      });

      updateUser(user);
      toast.success("پروفایل با موفقیت تکمیل شد");
      router.push("/");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "خطا در تکمیل پروفایل";
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
        placeholder="مثال: علی محمدی"
        {...register("full_name")}
        disabled={isLoading}
        error={errors.full_name?.message}
      />

      {/* Email */}
      <Input
        label="ایمیل (اختیاری)"
        type="email"
        dir="ltr"
        icon={MdiEmail}
        placeholder="example@email.com"
        {...register("email")}
        disabled={isLoading}
        error={errors.email?.message}
      />

      {/* Birthday */}
      <Input
        label="تاریخ تولد (اختیاری)"
        type="date"
        icon={MdiCake}
        {...register("birthday")}
        disabled={isLoading}
      />

      <Button type="submit" loading={isLoading} className="w-full" size="lg">
        تکمیل اطلاعات
      </Button>
    </form>
  );
}
