// src/modules/auth/types/auth.types.ts
export interface AuthUser {
  id: string;
  email: string | null;
  phone_number: string | null;
  full_name: string | null;
  role: "customer" | "admin" | "support";
  birthday: string;
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
  requiresProfileCompletion: boolean;
}

export interface Session {
  id: string;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  last_used_at: string | null;
  expires_at: string;
  is_current: boolean;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}
