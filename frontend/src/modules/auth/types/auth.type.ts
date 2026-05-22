// src/modules/auth/types/auth.types.ts
export interface AuthUser {
  id: string;
  email: string | null;
  phone_number: string | null;
  full_name: string;
  role: 'customer' | 'admin' | 'support';
  profile_completed: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface JWTPayload {
  userId: string;
  email?: string;
  phone?: string;
  role: string;
}

export interface SendOtpResponse {
  message: string;
  otpCode?: string; // only in dev
}

export interface VerifyOtpResponse {
  user: AuthUser;
  refreshToken: string;
  requiresProfileCompletion: boolean;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}