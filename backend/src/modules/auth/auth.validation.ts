// src/modules/auth/auth.validation.ts
import { z } from 'zod';

export const sendOtpSchema = z.object({
  phone_number: z
    .string()
    .regex(/^09[0-9]{9}$/, 'شماره تلفن نامعتبر است')
    .min(1, 'شماره تلفن الزامی است'),
});

export const verifyOtpSchema = z.object({
  phone_number: z
    .string()
    .regex(/^09[0-9]{9}$/, 'شماره تلفن نامعتبر است'),
  otp_code: z
    .string()
    .length(4, 'کد تایید باید 4 رقمی باشد')
    .regex(/^\d{4}$/, 'کد تایید نامعتبر است'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'رفرش توکن الزامی است'),
});

export const completeProfileSchema = z.object({
  full_name: z.string().min(2, 'نام کامل الزامی است'),
  email: z.string().email('ایمیل نامعتبر است').optional().nullable(),
  birthday: z.string().optional().nullable(),
});

export const updateProfileSchema = z.object({
  full_name: z.string().min(2, 'نام کامل الزامی است').optional(),
  email: z.string().email('ایمیل نامعتبر است').optional().nullable(),
  birthday: z.string().optional().nullable(),
});