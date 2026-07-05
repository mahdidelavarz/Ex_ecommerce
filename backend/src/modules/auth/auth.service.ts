// src/modules/auth/auth.service.ts
import bcrypt from "bcryptjs";
import { AppDataSource } from "../../config/database";
import { User, UserRole } from "../../database/entities/user.entity";
import { OtpCode } from "../../database/entities/otp-code.entity";
import { RefreshToken } from "../../database/entities/refresh-token.entity";
import { LoginLog } from "../../database/entities/login-log.entity";
import { JWTService } from "./auth.jwt";
import { SMSService } from "./sms.service";
import { env } from "../../config/env";
import {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  TooManyRequestsError,
} from "../../shared/utils/errors";
import { AuthUser, TokenPair } from "./auth.types";
import { AUTH } from "../../shared/constants/config.constants";

export class AuthService {
  private userRepository = AppDataSource.getRepository(User);
  private otpRepository = AppDataSource.getRepository(OtpCode);
  private refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
  private loginLogRepository = AppDataSource.getRepository(LoginLog);

  /**
   * Remove verified and expired OTP codes so the table doesn't grow unbounded
   */
  private async cleanupOtpCodes(): Promise<void> {
    await this.otpRepository
      .createQueryBuilder()
      .delete()
      .where('verified = true')
      .orWhere('expires_at < :now', { now: new Date() })
      .execute();
  }

  /**
   * Send OTP to phone number
   */
  async sendOTP(
    phoneNumber: string,
  ): Promise<{ message: string; otpCode?: string }> {
    await this.cleanupOtpCodes();

    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const recentOTP = await this.otpRepository.findOne({
      where: {
        phone_number: phoneNumber,
      },
      order: { created_at: "DESC" },
    });

    if (recentOTP && recentOTP.created_at > oneMinuteAgo) {
      throw new TooManyRequestsError(
        "لطفا یک دقیقه صبر کنید و دوباره تلاش کنید",
      );
    }

    const otpCode = SMSService.generateOTP();
    const expiresAt = new Date(
      Date.now() + env.otp.expirationMinutes * 60 * 1000,
    );
    const otpHash = await bcrypt.hash(otpCode, 10);

    const otpRecord = await this.otpRepository.save({
      phone_number: phoneNumber,
      otp_hash: otpHash,
      attempts: 0,
      expires_at: expiresAt,
      verified: false,
    });

    const smsResult = await SMSService.sendOTP(phoneNumber, otpCode);

    if (!smsResult.success) {
      await this.otpRepository.delete({ id: otpRecord.id });
      throw new BadRequestError(smsResult.message);
    }

    if (env.exposeOtp) {
      return {
        message: "کد تایید با موفقیت ارسال شد",
        otpCode,
      };
    }

    return { message: "کد تایید با موفقیت ارسال شد" };
  }

  /**
   * Verify OTP and login/register user
   */
  async verifyOTP(
    phoneNumber: string,
    otpCode: string,
    meta: { ipAddress?: string | null; userAgent?: string | null } = {},
  ): Promise<{
    user: AuthUser;
    tokens: TokenPair;
    requiresProfileCompletion: boolean;
  }> {
    const otpRecord = await this.otpRepository.findOne({
      where: {
        phone_number: phoneNumber,
        verified: false,
      },
      order: { created_at: "DESC" },
    });

    if (!otpRecord) {
      throw new NotFoundError("کد تایید یافت نشد");
    }

    if (new Date() > otpRecord.expires_at) {
      throw new BadRequestError("کد تایید منقضی شده است");
    }

    if (otpRecord.attempts >= env.otp.maxAttempts) {
      throw new TooManyRequestsError("تعداد تلاش‌های مجاز به پایان رسید");
    }

    const isValidOTP = await bcrypt.compare(otpCode, otpRecord.otp_hash);
    if (!isValidOTP) {
      otpRecord.attempts += 1;
      await this.otpRepository.save(otpRecord);

      const remainingAttempts = env.otp.maxAttempts - otpRecord.attempts;
      throw new BadRequestError(
        `کد تایید اشتباه است. ${remainingAttempts} تلاش باقی مانده`,
      );
    }

    // OTP is no longer needed once verified
    await this.otpRepository.delete({ phone_number: phoneNumber });

    // Find or create user - FIX: Proper null check and single object save
    let user = await this.userRepository.findOne({
      where: { phone_number: phoneNumber },
    });

    if (!user) {
      const newUser = this.userRepository.create({
        phone_number: phoneNumber,
        full_name: null,
        role: UserRole.CUSTOMER,
        profile_completed: false,
        is_active: true,
      });

      user = await this.userRepository.save(newUser);
    }

    // Now TypeScript guarantees user is not null
    const tokens = await this.generateTokenPair(user!, meta);

    const now = new Date();

    // Create login log
    await this.loginLogRepository.save({
      user_id: user!.id,
      ip_address: meta.ipAddress ?? null,
      user_agent: meta.userAgent ?? null,
      logged_in_at: now,
    });

    await this.userRepository.update(user!.id, { last_login_at: now });

    return {
      user: this.sanitizeUser(user!),
      tokens,
      requiresProfileCompletion: !user!.profile_completed,
    };
  }

  /**
   * Refresh access token
   */
  async refreshToken(
    refreshTokenString: string,
    meta: { ipAddress?: string | null; userAgent?: string | null } = {},
  ): Promise<TokenPair> {
    const payload = JWTService.verifyRefreshToken(refreshTokenString);
    if (!payload) {
      throw new UnauthorizedError("Invalid refresh token");
    }

    const tokens = await this.refreshTokenRepository.find({
      where: {
        user_id: payload.userId,
        revoked: false,
      },
      order: { created_at: "DESC" },
    });

    let validToken: RefreshToken | null = null;
    for (const token of tokens) {
      if (token.expires_at < new Date()) continue;

      const isValid = await bcrypt.compare(
        refreshTokenString,
        token.token_hash,
      );
      if (isValid) {
        validToken = token;
        break;
      }
    }

    if (!validToken) {
      throw new UnauthorizedError("Refresh token not found or expired");
    }

    const user = await this.userRepository.findOne({
      where: { id: payload.userId, is_active: true },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const newTokens = await this.generateTokenPair(user, meta);

    validToken.revoked = true;
    validToken.revoked_at = new Date();
    validToken.last_used_at = new Date();
    await this.refreshTokenRepository.save(validToken);

    return newTokens;
  }

  /**
   * Get current user
   */
  async getCurrentUser(userId: string): Promise<AuthUser> {
    const user = await this.userRepository.findOne({
      where: { id: userId, is_active: true },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return this.sanitizeUser(user);
  }

  /**
   * Logout user. If a refresh token is provided, only that session is
   * revoked; otherwise all of the user's sessions are revoked.
   */
  async logout(userId: string, refreshTokenString?: string): Promise<void> {
    if (refreshTokenString) {
      const tokens = await this.refreshTokenRepository.find({
        where: { user_id: userId, revoked: false },
      });

      for (const token of tokens) {
        const isValid = await bcrypt.compare(refreshTokenString, token.token_hash);
        if (isValid) {
          token.revoked = true;
          token.revoked_at = new Date();
          await this.refreshTokenRepository.save(token);
          return;
        }
      }
    }

    await this.refreshTokenRepository.update(
      { user_id: userId, revoked: false },
      { revoked: true, revoked_at: new Date() },
    );
  }

  /**
   * List active sessions (non-revoked, non-expired refresh tokens) for a user
   */
  async getSessions(userId: string, currentRefreshToken?: string): Promise<Array<{
    id: string;
    ip_address: string | null;
    user_agent: string | null;
    created_at: Date;
    last_used_at: Date | null;
    expires_at: Date;
    is_current: boolean;
  }>> {
    const tokens = await this.refreshTokenRepository.find({
      where: { user_id: userId, revoked: false },
      order: { created_at: 'DESC' },
    });

    const result = [];
    for (const token of tokens) {
      if (token.expires_at <= new Date()) continue;

      const isCurrent = currentRefreshToken
        ? await bcrypt.compare(currentRefreshToken, token.token_hash)
        : false;

      result.push({
        id: token.id,
        ip_address: token.ip_address,
        user_agent: token.user_agent,
        created_at: token.created_at,
        last_used_at: token.last_used_at,
        expires_at: token.expires_at,
        is_current: isCurrent,
      });
    }

    return result;
  }

  /**
   * Revoke a single session by refresh token id
   */
  async revokeSession(userId: string, sessionId: string): Promise<void> {
    const token = await this.refreshTokenRepository.findOne({
      where: { id: sessionId, user_id: userId },
    });

    if (!token) {
      throw new NotFoundError('Session not found');
    }

    token.revoked = true;
    token.revoked_at = new Date();
    await this.refreshTokenRepository.save(token);
  }

  /**
   * Deactivate the current user's account (soft delete) and revoke all sessions
   */
  async deleteAccount(userId: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    user.is_active = false;
    user.deleted_at = new Date();
    await this.userRepository.save(user);

    await this.refreshTokenRepository.update(
      { user_id: userId, revoked: false },
      { revoked: true, revoked_at: new Date() },
    );
  }

  /**
   * Complete user profile
   */
  async completeProfile(
    userId: string,
    profileData: {
      full_name: string;
      email?: string | null;
      birthday?: string | null;
    },
  ): Promise<AuthUser> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const email = profileData.email ? profileData.email.trim().toLowerCase() : null;

    if (email) {
      const existingUser = await this.userRepository.findOne({
        where: { email },
      });
      if (existingUser && existingUser.id !== userId) {
        throw new BadRequestError("This email is already in use");
      }
    }

    user.full_name = profileData.full_name;
    user.email = email || user.email;
    user.birthday = profileData.birthday
      ? new Date(profileData.birthday)
      : user.birthday;
    user.profile_completed = true;

    await this.userRepository.save(user);

    return this.sanitizeUser(user);
  }

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    profileData: {
      full_name?: string;
      email?: string | null;
      birthday?: string | null;
    },
  ): Promise<AuthUser> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const email = profileData.email ? profileData.email.trim().toLowerCase() : profileData.email;

    if (email) {
      const existingUser = await this.userRepository.findOne({
        where: { email },
      });
      if (existingUser && existingUser.id !== userId) {
        throw new BadRequestError("This email is already in use");
      }
    }

    if (profileData.full_name) user.full_name = profileData.full_name;
    if (profileData.email !== undefined) user.email = email ?? null;
    if (profileData.birthday !== undefined) {
      user.birthday = profileData.birthday
        ? new Date(profileData.birthday)
        : null;
    }

    await this.userRepository.save(user);

    return this.sanitizeUser(user);
  }

  /**
   * Private helper methods
   */
  private async generateTokenPair(
    user: User,
    meta: { ipAddress?: string | null; userAgent?: string | null } = {},
  ): Promise<TokenPair> {
    const payload = {
      userId: user.id,
      email: user.email || undefined,
      phone: user.phone_number || undefined,
      role: user.role,
    };

    const accessToken = JWTService.generateAccessToken(payload);
    const refreshToken = JWTService.generateRefreshToken(payload);

    const tokenHash = await bcrypt.hash(refreshToken, 10);
    const expiresAt = new Date(Date.now() + AUTH.REFRESH_TOKEN_TTL_MS);

    await this.refreshTokenRepository.save({
      user_id: user.id,
      token_hash: tokenHash,
      ip_address: meta.ipAddress ?? null,
      user_agent: meta.userAgent ?? null,
      expires_at: expiresAt,
    });

    return { accessToken, refreshToken };
  }

  private sanitizeUser(user: User): AuthUser {
    return {
      id: user.id,
      email: user.email,
      phone_number: user.phone_number,
      full_name: user.full_name,
      role: user.role,
      profile_completed: user.profile_completed,
      is_active: user.is_active,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }
}
