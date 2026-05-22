// src/modules/auth/auth.service.ts
import bcrypt from 'bcryptjs';
import { AppDataSource } from '../../config/database';
import { User, UserRole } from '../../database/entities/user.entity';
import { OtpCode } from '../../database/entities/otp-code.entity';
import { RefreshToken } from '../../database/entities/refresh-token.entity';
import { LoginLog } from '../../database/entities/login-log.entity';
import { JWTService } from './auth.jwt';
import { SMSService } from './sms.service';
import { env } from '../../config/env';
import {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  TooManyRequestsError,
} from '../../shared/utils/errors';
import { AuthUser, TokenPair } from './auth.types';

export class AuthService {
  private userRepository = AppDataSource.getRepository(User);
  private otpRepository = AppDataSource.getRepository(OtpCode);
  private refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
  private loginLogRepository = AppDataSource.getRepository(LoginLog);

  /**
   * Send OTP to phone number
   */
  async sendOTP(phoneNumber: string): Promise<{ message: string; otpCode?: string }> {
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const recentOTP = await this.otpRepository.findOne({
      where: {
        phone_number: phoneNumber,
      },
      order: { created_at: 'DESC' },
    });

    if (recentOTP && recentOTP.created_at > oneMinuteAgo) {
      throw new TooManyRequestsError('لطفا یک دقیقه صبر کنید و دوباره تلاش کنید');
    }

    const otpCode = SMSService.generateOTP();
    const expiresAt = new Date(Date.now() + env.otp.expirationMinutes * 60 * 1000);
    const otpHash = await bcrypt.hash(otpCode, 10);

    await this.otpRepository.save({
      phone_number: phoneNumber,
      otp_hash: otpHash,
      attempts: 0,
      expires_at: expiresAt,
      verified: false,
    });

    await SMSService.sendOTP(phoneNumber, otpCode);

    if (env.nodeEnv === 'development') {
      return {
        message: 'کد تایید با موفقیت ارسال شد',
        otpCode,
      };
    }

    return { message: 'کد تایید با موفقیت ارسال شد' };
  }

  /**
   * Verify OTP and login/register user
   */
  async verifyOTP(phoneNumber: string, otpCode: string): Promise<{
    user: AuthUser;
    tokens: TokenPair;
    requiresProfileCompletion: boolean;
  }> {
    const otpRecord = await this.otpRepository.findOne({
      where: {
        phone_number: phoneNumber,
        verified: false,
      },
      order: { created_at: 'DESC' },
    });

    if (!otpRecord) {
      throw new NotFoundError('کد تایید یافت نشد');
    }

    if (new Date() > otpRecord.expires_at) {
      throw new BadRequestError('کد تایید منقضی شده است');
    }

    if (otpRecord.attempts >= env.otp.maxAttempts) {
      throw new TooManyRequestsError('تعداد تلاش‌های مجاز به پایان رسید');
    }

    const isValidOTP = await bcrypt.compare(otpCode, otpRecord.otp_hash);
    if (!isValidOTP) {
      otpRecord.attempts += 1;
      await this.otpRepository.save(otpRecord);
      
      const remainingAttempts = env.otp.maxAttempts - otpRecord.attempts;
      throw new BadRequestError(
        `کد تایید اشتباه است. ${remainingAttempts} تلاش باقی مانده`
      );
    }

    otpRecord.verified = true;
    await this.otpRepository.save(otpRecord);

    // Find or create user - FIX: Proper null check and single object save
    let user = await this.userRepository.findOne({
      where: { phone_number: phoneNumber },
    });

    if (!user) {
      // Create user as a single object, save returns User
      const newUser = this.userRepository.create({
        phone_number: phoneNumber,
        role: UserRole.CUSTOMER,
        profile_completed: false,
        is_active: true,
      } as Partial<User>);
      
      user = await this.userRepository.save(newUser as User);
    }

    // Now TypeScript guarantees user is not null
    const tokens = await this.generateTokenPair(user!);

    // Create login log
    await this.loginLogRepository.save({
      user_id: user!.id,
      logged_in_at: new Date(),
    });

    return {
      user: this.sanitizeUser(user!),
      tokens,
      requiresProfileCompletion: !user!.profile_completed,
    };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshTokenString: string): Promise<TokenPair> {
    const payload = JWTService.verifyRefreshToken(refreshTokenString);
    if (!payload) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    const tokens = await this.refreshTokenRepository.find({
      where: {
        user_id: payload.userId,
        revoked: false,
      },
      order: { created_at: 'DESC' },
    });

    let validToken: RefreshToken | null = null;
    for (const token of tokens) {
      if (token.expires_at < new Date()) continue;
      
      const isValid = await bcrypt.compare(refreshTokenString, token.token_hash);
      if (isValid) {
        validToken = token;
        break;
      }
    }

    if (!validToken) {
      throw new UnauthorizedError('Refresh token not found or expired');
    }

    const user = await this.userRepository.findOne({
      where: { id: payload.userId, is_active: true },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const newTokens = await this.generateTokenPair(user);

    validToken.revoked = true;
    validToken.revoked_at = new Date();
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
      throw new NotFoundError('User not found');
    }

    return this.sanitizeUser(user);
  }

  /**
   * Logout user
   */
  async logout(userId: string): Promise<void> {
    await this.refreshTokenRepository.update(
      { user_id: userId, revoked: false },
      { revoked: true, revoked_at: new Date() }
    );
  }

  /**
   * Complete user profile
   */
  async completeProfile(userId: string, profileData: {
    full_name: string;
    email?: string | null;
    birthday?: string | null;
  }): Promise<AuthUser> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (profileData.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: profileData.email },
      });
      if (existingUser && existingUser.id !== userId) {
        throw new BadRequestError('This email is already in use');
      }
    }

    user.full_name = profileData.full_name;
    user.email = profileData.email || user.email;
    user.birthday = profileData.birthday ? new Date(profileData.birthday) : user.birthday;
    user.profile_completed = true;

    await this.userRepository.save(user);

    return this.sanitizeUser(user);
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, profileData: {
    full_name?: string;
    email?: string | null;
    birthday?: string | null;
  }): Promise<AuthUser> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (profileData.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: profileData.email },
      });
      if (existingUser && existingUser.id !== userId) {
        throw new BadRequestError('This email is already in use');
      }
    }

    if (profileData.full_name) user.full_name = profileData.full_name;
    if (profileData.email !== undefined) user.email = profileData.email;
    if (profileData.birthday !== undefined) {
      user.birthday = profileData.birthday ? new Date(profileData.birthday) : null;
    }

    await this.userRepository.save(user);

    return this.sanitizeUser(user);
  }

  /**
   * Google OAuth callback
   */
  async handleGoogleCallback(googleUser: {
    email: string;
    full_name?: string;
    phone?: string | null;
  }): Promise<{ user: AuthUser; tokens: TokenPair; isNewUser: boolean }> {
    let user = await this.userRepository.findOne({
      where: { email: googleUser.email },
    });

    const isNewUser = !user;

    if (!user) {
      const newUser = this.userRepository.create({
        email: googleUser.email,
        phone_number: googleUser.phone || null,
        full_name: googleUser.full_name || '',
        role: UserRole.CUSTOMER,
        profile_completed: !!googleUser.full_name,
        is_active: true,
      } as Partial<User>);
      
      user = await this.userRepository.save(newUser as User);
    }

    const tokens = await this.generateTokenPair(user!);

    return {
      user: this.sanitizeUser(user!),
      tokens,
      isNewUser,
    };
  }

  /**
   * Private helper methods
   */
  private async generateTokenPair(user: User): Promise<TokenPair> {
    const payload = {
      userId: user.id,
      email: user.email || undefined,
      phone: user.phone_number || undefined,
      role: user.role,
    };

    const accessToken = JWTService.generateAccessToken(payload);
    const refreshToken = JWTService.generateRefreshToken(payload);

    const tokenHash = await bcrypt.hash(refreshToken, 10);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await this.refreshTokenRepository.save({
      user_id: user.id,
      token_hash: tokenHash,
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