// src/shared/utils/cookies.ts
import { CookieOptions, Response } from 'express';
import { env } from '../../config/env';

export const ACCESS_TOKEN_COOKIE = 'accessToken';
export const REFRESH_TOKEN_COOKIE = 'refreshToken';

const isProd = env.nodeEnv === 'production';

const baseCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'strict' : 'lax',
  path: '/',
};

// Refresh token is only ever needed by the refresh/logout endpoints
const refreshCookieOptions: CookieOptions = {
  ...baseCookieOptions,
  path: `${env.apiPrefix}/auth`,
};

export function setAccessTokenCookie(res: Response, token: string): void {
  res.cookie(ACCESS_TOKEN_COOKIE, token, {
    ...baseCookieOptions,
    maxAge: 15 * 60 * 1000,
  });
}

export function setRefreshTokenCookie(res: Response, token: string): void {
  res.cookie(REFRESH_TOKEN_COOKIE, token, {
    ...refreshCookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export function clearAuthCookies(res: Response): void {
  res.cookie(ACCESS_TOKEN_COOKIE, '', { ...baseCookieOptions, maxAge: 0 });
  res.cookie(REFRESH_TOKEN_COOKIE, '', { ...refreshCookieOptions, maxAge: 0 });
}
