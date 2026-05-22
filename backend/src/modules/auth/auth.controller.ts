// src/modules/auth/auth.controller.ts
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { asyncHandler } from '../../middleware/asyncHandler';
import { ApiResponseHelper } from '../../shared/utils/response';
import { Messages } from '../../shared/constants/messages';
import { env } from '../../config/env';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * POST /api/v1/auth/send-otp
   */
  sendOTP = asyncHandler(async (req: Request, res: Response) => {
    const { phone_number } = req.body;
    const result = await this.authService.sendOTP(phone_number);

    // Set cookie for development OTP (auto-fill in frontend)
    if (env.nodeEnv === 'development' && result.otpCode) {
      res.cookie('dev_otp', result.otpCode, {
        httpOnly: false,
        secure: false,
        sameSite: 'lax',
        maxAge: 2 * 60 * 1000, // 2 minutes
        path: '/',
      });
    }

    ApiResponseHelper.success(res, result, Messages.AUTH.OTP_SENT);
  });

  /**
   * POST /api/v1/auth/verify-otp
   */
  verifyOTP = asyncHandler(async (req: Request, res: Response) => {
    const { phone_number, otp_code } = req.body;
    const result = await this.authService.verifyOTP(phone_number, otp_code);

    // Set access token as httpOnly cookie
    res.cookie('accessToken', result.tokens.accessToken, {
      httpOnly: true,
      secure: env.nodeEnv === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
      path: '/',
    });

    ApiResponseHelper.success(res, {
      user: result.user,
      refreshToken: result.tokens.refreshToken,
      requiresProfileCompletion: result.requiresProfileCompletion,
    }, Messages.AUTH.OTP_VERIFIED);
  });

  /**
   * POST /api/v1/auth/refresh
   */
  refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    const tokens = await this.authService.refreshToken(refreshToken);

    // Set new access token
    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: env.nodeEnv === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
      path: '/',
    });

    ApiResponseHelper.success(res, {
      refreshToken: tokens.refreshToken,
    }, Messages.AUTH.TOKEN_REFRESHED);
  });

  /**
   * GET /api/v1/auth/me
   */
  getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
    const user = await this.authService.getCurrentUser(req.userId!);
    ApiResponseHelper.success(res, { user });
  });

  /**
   * POST /api/v1/auth/logout
   */
  logout = asyncHandler(async (req: Request, res: Response) => {
    await this.authService.logout(req.userId!);

    res.cookie('accessToken', '', {
      httpOnly: true,
      secure: env.nodeEnv === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    });

    ApiResponseHelper.success(res, null, Messages.AUTH.LOGOUT_SUCCESS);
  });

  /**
   * PUT /api/v1/auth/profile
   */
  completeProfile = asyncHandler(async (req: Request, res: Response) => {
    const user = await this.authService.completeProfile(req.userId!, req.body);
    ApiResponseHelper.success(res, { user }, Messages.USERS.PROFILE_UPDATED);
  });

  /**
   * PATCH /api/v1/auth/profile
   */
  updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const user = await this.authService.updateProfile(req.userId!, req.body);
    ApiResponseHelper.success(res, { user }, Messages.USERS.PROFILE_UPDATED);
  });

  /**
   * GET /api/v1/auth/callback
   * Google OAuth callback
   */
  googleCallback = asyncHandler(async (req: Request, res: Response) => {
    // This would be implemented based on your Google OAuth flow
    // For now, return a placeholder
    ApiResponseHelper.success(res, null, 'Google callback endpoint');
  });
}