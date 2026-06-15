// src/modules/auth/services/auth.service.ts
import { apiClient } from '@/lib/api-client';
import type {
  ApiResponse,
  AuthUser,
  SendOtpResponse,
  VerifyOtpResponse,
  Session,
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
   * Refresh access token. The refresh token itself lives in an httpOnly
   * cookie, so nothing needs to be sent or stored on the client.
   */
  refreshToken: async (): Promise<void> => {
    await apiClient.post('/auth/refresh');
  },

  /**
   * Logout
   */
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
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

  /**
   * List active sessions for the current user
   */
  getSessions: async (): Promise<Session[]> => {
    const response = await apiClient.get<ApiResponse<{ sessions: Session[] }>>(
      '/auth/sessions'
    );
    return response.data.data.sessions;
  },

  /**
   * Revoke a single session
   */
  revokeSession: async (sessionId: string): Promise<void> => {
    await apiClient.delete(`/auth/sessions/${sessionId}`);
  },

  /**
   * Deactivate the current account
   */
  deleteAccount: async (): Promise<void> => {
    await apiClient.delete('/auth/account');
  },
};
