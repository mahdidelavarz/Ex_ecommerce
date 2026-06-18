// src/config/env.ts
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000'),
  API_PREFIX: z.string().default('/api/v1'),
  
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.string().default('5432'),
  DB_USERNAME: z.string().default('postgres'),
  DB_PASSWORD: z.string().default('password'),
  DB_NAME: z.string().default('ecommerce'),
  DB_SSL: z.string().default('false'),
  
  JWT_ACCESS_SECRET: z.string().min(10),
  JWT_REFRESH_SECRET: z.string().min(10),
  JWT_ACCESS_EXPIRATION: z.string().default('15m'),
  JWT_REFRESH_EXPIRATION: z.string().default('7d'),
  
  OTP_EXPIRATION_MINUTES: z.string().default('10'),
  OTP_MAX_ATTEMPTS: z.string().default('3'),
  
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  
  RATE_LIMIT_WINDOW_MS: z.string().default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().default('100'),
  
  MAX_FILE_SIZE: z.string().default('5242880'),
  UPLOAD_PATH: z.string().default('./uploads'),

  ZARINPAL_MERCHANT_ID: z.string().default(''),
  ZARINPAL_SANDBOX: z.string().default('true'),
  ZARINPAL_CALLBACK_URL: z.string().default('http://localhost:5000/api/v1/payments/verify'),
  FRONTEND_URL: z.string().default('http://localhost:3000'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = {
  nodeEnv: parsed.data.NODE_ENV,
  port: parseInt(parsed.data.PORT),
  apiPrefix: parsed.data.API_PREFIX,
  
  db: {
    host: parsed.data.DB_HOST,
    port: parseInt(parsed.data.DB_PORT),
    username: parsed.data.DB_USERNAME,
    password: parsed.data.DB_PASSWORD,
    database: parsed.data.DB_NAME,
    ssl: parsed.data.DB_SSL === 'true',
  },
  
  jwt: {
    accessSecret: parsed.data.JWT_ACCESS_SECRET,
    refreshSecret: parsed.data.JWT_REFRESH_SECRET,
    accessExpiration: parsed.data.JWT_ACCESS_EXPIRATION,
    refreshExpiration: parsed.data.JWT_REFRESH_EXPIRATION,
  },
  
  otp: {
    expirationMinutes: parseInt(parsed.data.OTP_EXPIRATION_MINUTES),
    maxAttempts: parseInt(parsed.data.OTP_MAX_ATTEMPTS),
  },
  
  cors: {
    origin: parsed.data.CORS_ORIGIN,
  },
  
  rateLimit: {
    windowMs: parseInt(parsed.data.RATE_LIMIT_WINDOW_MS),
    maxRequests: parseInt(parsed.data.RATE_LIMIT_MAX_REQUESTS),
  },
  
  upload: {
    maxFileSize: parseInt(parsed.data.MAX_FILE_SIZE),
    path: parsed.data.UPLOAD_PATH,
  },

  zarinpal: {
    merchantId: parsed.data.ZARINPAL_MERCHANT_ID,
    sandbox: parsed.data.ZARINPAL_SANDBOX === 'true',
    callbackUrl: parsed.data.ZARINPAL_CALLBACK_URL,
  },
  frontendUrl: parsed.data.FRONTEND_URL,
};