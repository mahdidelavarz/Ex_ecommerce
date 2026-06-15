// src/modules/auth/auth.controller.ts
import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { asyncHandler } from "../../middleware/asyncHandler";
import { ApiResponseHelper } from "../../shared/utils/response";
import { Messages } from "../../shared/constants/messages";
import { env } from "../../config/env";
import { UnauthorizedError } from "../../shared/utils/errors";
import {
  setAccessTokenCookie,
  setRefreshTokenCookie,
  clearAuthCookies,
  REFRESH_TOKEN_COOKIE,
} from "../../shared/utils/cookies";

function getRequestMeta(req: Request): { ipAddress: string | null; userAgent: string | null } {
  return {
    ipAddress: req.ip ?? req.socket.remoteAddress ?? null,
    userAgent: req.headers["user-agent"] ?? null,
  };
}

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
    if (env.nodeEnv === "development" && result.otpCode) {
      res.cookie("dev_otp", result.otpCode, {
        httpOnly: false,
        secure: false,
        sameSite: "lax",
        maxAge: 2 * 60 * 1000, // 2 minutes
        path: "/",
      });
    }

    ApiResponseHelper.success(res, result, Messages.AUTH.OTP_SENT);
  });

  /**
   * POST /api/v1/auth/verify-otp
   */
  verifyOTP = asyncHandler(async (req: Request, res: Response) => {
    const { phone_number, otp_code } = req.body;
    const result = await this.authService.verifyOTP(phone_number, otp_code, getRequestMeta(req));

    setAccessTokenCookie(res, result.tokens.accessToken);
    setRefreshTokenCookie(res, result.tokens.refreshToken);

    ApiResponseHelper.success(
      res,
      {
        user: result.user,
        requiresProfileCompletion: result.requiresProfileCompletion,
      },
      Messages.AUTH.OTP_VERIFIED,
    );
  });

  /**
   * POST /api/v1/auth/refresh
   */
  refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const refreshTokenString = req.cookies?.[REFRESH_TOKEN_COOKIE];

    if (!refreshTokenString) {
      throw new UnauthorizedError("Refresh token not found");
    }

    const tokens = await this.authService.refreshToken(refreshTokenString, getRequestMeta(req));

    setAccessTokenCookie(res, tokens.accessToken);
    setRefreshTokenCookie(res, tokens.refreshToken);

    ApiResponseHelper.success(res, null, Messages.AUTH.TOKEN_REFRESHED);
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
    const refreshTokenString = req.cookies?.[REFRESH_TOKEN_COOKIE];
    await this.authService.logout(req.userId!, refreshTokenString);

    clearAuthCookies(res);

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
   * DELETE /api/v1/auth/account
   */
  deleteAccount = asyncHandler(async (req: Request, res: Response) => {
    await this.authService.deleteAccount(req.userId!);

    clearAuthCookies(res);

    ApiResponseHelper.success(res, null, Messages.USERS.DELETED);
  });

  /**
   * GET /api/v1/auth/sessions
   */
  getSessions = asyncHandler(async (req: Request, res: Response) => {
    const currentRefreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE];
    const sessions = await this.authService.getSessions(req.userId!, currentRefreshToken);

    ApiResponseHelper.success(res, { sessions });
  });

  /**
   * DELETE /api/v1/auth/sessions/:id
   */
  revokeSession = asyncHandler(async (req: Request, res: Response) => {
    await this.authService.revokeSession(req.userId!, req.params.id);
    ApiResponseHelper.success(res, null, Messages.AUTH.LOGOUT_SUCCESS);
  });
}
