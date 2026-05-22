// src/modules/auth/auth.types.ts
export interface JWTPayload {
  userId: string;
  email?: string;
  phone?: string;
  role: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser {
  id: string;
  email: string | null;
  phone_number: string | null;
  full_name: string;
  role: "customer" | "admin" | "support";
  profile_completed: boolean;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface SendOtpRequest {
  phone_number: string;
}

export interface VerifyOtpRequest {
  phone_number: string;
  otp_code: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: AuthUser;
  refreshToken?: string;
  requiresProfileCompletion?: boolean;
  otpCode?: string; // FOR TESTING ONLY
}
