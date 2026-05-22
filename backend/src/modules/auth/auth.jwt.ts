// src/modules/auth/auth.jwt.ts
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { JWTPayload } from './auth.types';

export class JWTService {
  /**
   * Generate Access Token (short-lived)
   */
  static generateAccessToken(payload: JWTPayload): string {
    return jwt.sign(payload, env.jwt.accessSecret, {
      expiresIn: env.jwt.accessExpiration,
    } as jwt.SignOptions);
  }

  /**
   * Generate Refresh Token (long-lived)
   */
  static generateRefreshToken(payload: JWTPayload): string {
    return jwt.sign(payload, env.jwt.refreshSecret, {
      expiresIn: env.jwt.refreshExpiration,
    } as jwt.SignOptions);
  }

  /**
   * Verify Access Token
   */
  static verifyAccessToken(token: string): JWTPayload | null {
    try {
      return jwt.verify(token, env.jwt.accessSecret) as JWTPayload;
    } catch (error) {
      console.error('Access token verification failed:', error);
      return null;
    }
  }

  /**
   * Verify Refresh Token
   */
  static verifyRefreshToken(token: string): JWTPayload | null {
    try {
      return jwt.verify(token, env.jwt.refreshSecret) as JWTPayload;
    } catch (error) {
      console.error('Refresh token verification failed:', error);
      return null;
    }
  }

  /**
   * Decode token without verification
   */
  static decodeToken(token: string): JWTPayload | null {
    try {
      return jwt.decode(token) as JWTPayload;
    } catch (error) {
      return null;
    }
  }
}