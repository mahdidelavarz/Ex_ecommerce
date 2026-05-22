// src/modules/auth/services/auth.service.ts
import { apiClient } from '@/lib/api-client';
import type {
  ApiResponse,
  AuthUser,
  SendOtpResponse,
  VerifyOtpResponse,
} from '../types/auth.type';

export const authService = {
  /**
   * Send OTP to phone number
   */
  sendOtp: async (phone_number: string): Promise<SendOtpResponse> => {
    const response = await apiClient.post<ApiResponse<SendOtpResponse>>(
      '/auth/send-otp',
      { phone_number }
    );
    return response.data.data;
  },

  /**
   * Verify OTP and login/register
   */
  verifyOtp: async (
    phone_number: string,
    otp_code: string
  ): Promise<VerifyOtpResponse> => {
    const response = await apiClient.post<ApiResponse<VerifyOtpResponse>>(
      '/auth/verify-otp',
      { phone_number, otp_code }
    );

    // Store refresh token
    if (typeof window !== 'undefined' && response.data.data.refreshToken) {
      localStorage.setItem('refreshToken', response.data.data.refreshToken);
    }

    return response.data.data;
  },

  /**
   * Get current user
   */
  getMe: async (): Promise<AuthUser> => {
    const response = await apiClient.get<ApiResponse<{ user: AuthUser }>>('/auth/me');
    return response.data.data.user;
  },

  /**
   * Refresh access token
   */
  refreshToken: async (refreshToken: string): Promise<string> => {
    const response = await apiClient.post<ApiResponse<{ refreshToken: string }>>(
      '/auth/refresh',
      { refreshToken }
    );

    const newRefreshToken = response.data.data.refreshToken;
    if (typeof window !== 'undefined' && newRefreshToken) {
      localStorage.setItem('refreshToken', newRefreshToken);
    }

    return newRefreshToken;
  },

  /**
   * Logout
   */
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('refreshToken');
    }
  },

  /**
   * Complete profile (new user)
   */
  completeProfile: async (data: {
    full_name: string;
    email?: string | null;
    birthday?: string | null;
  }): Promise<AuthUser> => {
    const response = await apiClient.put<ApiResponse<{ user: AuthUser }>>(
      '/auth/profile',
      data
    );
    return response.data.data.user;
  },

  /**
   * Update profile
   */
  updateProfile: async (data: {
    full_name?: string;
    email?: string | null;
    birthday?: string | null;
  }): Promise<AuthUser> => {
    const response = await apiClient.patch<ApiResponse<{ user: AuthUser }>>(
      '/auth/profile',
      data
    );
    return response.data.data.user;
  },
};