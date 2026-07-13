// src/middleware/rateLimiter.ts
import rateLimit from 'express-rate-limit';
import type { RateLimitExceededEventHandler } from 'express-rate-limit';
import { env } from '../config/env';

// Rate limits are a production protection. In development a normal SPA session
// (React Query refetches, cart/wishlist polling, StrictMode double-invokes)
// easily exceeds them, so skip limiting outside production.
const isDev = env.nodeEnv !== 'production';

const limiterMessage = (message: string) => ({
  success: false,
  statusCode: 429,
  message,
});

const noStoreLimitHandler: RateLimitExceededEventHandler = (
  _req,
  res,
  _next,
  options,
) => {
  // A CDN must never cache a temporary block and replay it to other shoppers.
  res.setHeader('Cache-Control', 'private, no-store, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.status(options.statusCode).json(options.message);
};

const phoneKey = (phone: unknown): string =>
  typeof phone === 'string' && phone.trim() ? phone.trim() : 'missing-phone';

/**
 * Broad protection for state-changing API traffic. Public GET/HEAD requests
 * are deliberately excluded: catalog reads are cached by Next/React Query and
 * must not share a small in-memory quota behind the storefront proxy.
 */
export const apiMutationLimiter = rateLimit({
  windowMs: env.rateLimit.apiWindowMs,
  max: env.rateLimit.apiMaxMutations,
  message: limiterMessage('Too many changes, please try again shortly'),
  standardHeaders: true,
  legacyHeaders: false,
  handler: noStoreLimitHandler,
  skip: (req) => isDev || ['GET', 'HEAD', 'OPTIONS'].includes(req.method),
});

/** Per-IP SMS budget protects the provider from broad request floods. */
export const sendOtpIpLimiter = rateLimit({
  windowMs: env.rateLimit.otpWindowMs,
  max: env.rateLimit.otpSendIpMax,
  message: limiterMessage('Too many OTP requests, please try again later'),
  standardHeaders: true,
  legacyHeaders: false,
  handler: noStoreLimitHandler,
  skip: () => isDev,
});

/** Per-phone budget prevents one number being spammed from many IPs. */
export const sendOtpPhoneLimiter = rateLimit({
  windowMs: env.rateLimit.otpWindowMs,
  max: env.rateLimit.otpSendPhoneMax,
  keyGenerator: (req) => phoneKey(req.body?.phone_number),
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many OTP requests, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: noStoreLimitHandler,
  skip: () => isDev,
});

/** Per-IP verification budget slows distributed guessing. */
export const verifyOtpIpLimiter = rateLimit({
  windowMs: env.rateLimit.otpWindowMs,
  max: env.rateLimit.otpVerifyIpMax,
  message: limiterMessage('Too many OTP verification attempts, please try again later'),
  standardHeaders: true,
  legacyHeaders: false,
  handler: noStoreLimitHandler,
  skip: () => isDev,
  skipSuccessfulRequests: true,
});

/** Per-phone verification budget protects an individual OTP challenge. */
export const verifyOtpPhoneLimiter = rateLimit({
  windowMs: env.rateLimit.otpWindowMs,
  max: env.rateLimit.otpVerifyPhoneMax,
  keyGenerator: (req) => phoneKey(req.body?.phone_number),
  message: limiterMessage('Too many OTP verification attempts, please try again later'),
  standardHeaders: true,
  legacyHeaders: false,
  handler: noStoreLimitHandler,
  skip: () => isDev,
  skipSuccessfulRequests: true,
});
