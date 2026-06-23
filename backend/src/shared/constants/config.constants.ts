// src/shared/constants/config.constants.ts
//
// Centralized config "magic numbers" (M-19). Single source of truth for auth
// token lifetimes, OTP, etc. The string TTLs feed jsonwebtoken's `expiresIn`,
// while the *_MS variants feed cookie `maxAge` and DB expiry timestamps — they
// are derived from the same numbers so they can never drift apart.
const ACCESS_TOKEN_TTL_MINUTES = 30;
const REFRESH_TOKEN_TTL_DAYS = 30;

export const AUTH = {
  OTP_EXPIRY_MS: 10 * 60 * 1000,
  OTP_MAX_ATTEMPTS: 3,

  ACCESS_TOKEN_TTL: `${ACCESS_TOKEN_TTL_MINUTES}m`, // '30m'
  REFRESH_TOKEN_TTL: `${REFRESH_TOKEN_TTL_DAYS}d`, // '30d'

  ACCESS_TOKEN_TTL_MS: ACCESS_TOKEN_TTL_MINUTES * 60 * 1000,
  REFRESH_TOKEN_TTL_MS: REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
} as const;
