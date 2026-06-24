// src/middleware/rateLimiter.ts
import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

// Rate limits are a production protection. In development a normal SPA session
// (React Query refetches, cart/wishlist polling, StrictMode double-invokes)
// easily exceeds them, so skip limiting outside production.
const isDev = env.nodeEnv !== 'production';

export const generalLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.maxRequests,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many requests, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isDev,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many authentication attempts, please try again after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isDev,
});

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 300,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many API requests, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isDev,
});