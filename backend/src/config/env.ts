// src/config/env.ts
import dotenv from 'dotenv';
import { z } from 'zod';
import { AUTH } from '../shared/constants/config.constants';

dotenv.config();

if (process.env.npm_lifecycle_event === 'dev' || process.env.NODE_ENV === 'development') {
  dotenv.config({ path: '.env.local', override: true });
}

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000'),
  API_PREFIX: z.string().default('/api/v1'),
  
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.string().default('5432'),
  DB_USERNAME: z.string().default('postgres'),
  DB_PASSWORD: z.string().default('password'),
  DB_NAME: z.string().default('ecommerce'),
  DB_SSL: z.string().optional(),
  
  JWT_ACCESS_SECRET: z.string().min(10),
  JWT_REFRESH_SECRET: z.string().min(10),
  JWT_ACCESS_EXPIRATION: z.string().default(AUTH.ACCESS_TOKEN_TTL),
  JWT_REFRESH_EXPIRATION: z.string().default(AUTH.REFRESH_TOKEN_TTL),

  OTP_EXPIRATION_MINUTES: z.string().default(String(AUTH.OTP_EXPIRY_MS / 60000)),
  OTP_MAX_ATTEMPTS: z.string().default(String(AUTH.OTP_MAX_ATTEMPTS)),

  KAVENEGAR_API_KEY: z.string().optional(),
  KAVENEGAR_SENDER: z.string().optional(),
  KAVENEGAR_VERIFY_TEMPLATE: z.string().optional(),
  
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  TRUST_PROXY_HOPS: z.string().regex(/^\d+$/).default('1'),
  
  API_RATE_LIMIT_WINDOW_MS: z.string().default('60000'),
  API_RATE_LIMIT_MAX_MUTATIONS: z.string().default('300'),
  OTP_RATE_LIMIT_WINDOW_MS: z.string().default('900000'),
  OTP_SEND_IP_MAX: z.string().default('200'),
  OTP_SEND_PHONE_MAX: z.string().default('3'),
  OTP_VERIFY_IP_MAX: z.string().default('1000'),
  OTP_VERIFY_PHONE_MAX: z.string().default('10'),
  
  MAX_FILE_SIZE: z.string().default('5242880'),
  UPLOAD_PATH: z.string().default('./uploads'),

  S3_BUCKET: z.string().optional(),
  S3_REGION: z.string().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  S3_ENDPOINT: z.string().optional(),

  EXPOSE_OTP: z.string().default('false'),

  ZARINPAL_MERCHANT_ID: z.string().default(''),
  ZARINPAL_SANDBOX: z.string().default('true'),
  ZARINPAL_CALLBACK_URL: z.string().default('http://localhost:5000/api/v1/payments/verify'),
  FRONTEND_URL: z.string().default('http://localhost:3000'),
}).superRefine((data, ctx) => {
  if (data.NODE_ENV !== 'production') return;

  if (!data.KAVENEGAR_API_KEY?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['KAVENEGAR_API_KEY'],
      message: 'KAVENEGAR_API_KEY is required in production',
    });
  }

  if (!data.KAVENEGAR_VERIFY_TEMPLATE?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['KAVENEGAR_VERIFY_TEMPLATE'],
      message: 'KAVENEGAR_VERIFY_TEMPLATE is required in production',
    });
  }
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
    ssl: parsed.data.DB_SSL !== undefined
      ? parsed.data.DB_SSL === 'true'
      : parsed.data.NODE_ENV === 'production',
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

  sms: {
    kavenegarApiKey: parsed.data.KAVENEGAR_API_KEY ?? '',
    kavenegarSender: parsed.data.KAVENEGAR_SENDER ?? '',
    kavenegarVerifyTemplate: parsed.data.KAVENEGAR_VERIFY_TEMPLATE ?? '',
  },
  
  cors: {
    origin: parsed.data.CORS_ORIGIN,
  },

  trustProxyHops: parseInt(parsed.data.TRUST_PROXY_HOPS),
  
  rateLimit: {
    apiWindowMs: parseInt(parsed.data.API_RATE_LIMIT_WINDOW_MS),
    apiMaxMutations: parseInt(parsed.data.API_RATE_LIMIT_MAX_MUTATIONS),
    otpWindowMs: parseInt(parsed.data.OTP_RATE_LIMIT_WINDOW_MS),
    otpSendIpMax: parseInt(parsed.data.OTP_SEND_IP_MAX),
    otpSendPhoneMax: parseInt(parsed.data.OTP_SEND_PHONE_MAX),
    otpVerifyIpMax: parseInt(parsed.data.OTP_VERIFY_IP_MAX),
    otpVerifyPhoneMax: parseInt(parsed.data.OTP_VERIFY_PHONE_MAX),
  },
  
  upload: {
    maxFileSize: parseInt(parsed.data.MAX_FILE_SIZE),
    path: parsed.data.UPLOAD_PATH,
  },

  s3: {
    bucket: parsed.data.S3_BUCKET,
    region: parsed.data.S3_REGION ?? 'us-east-1',
    accessKeyId: parsed.data.S3_ACCESS_KEY_ID,
    secretAccessKey: parsed.data.S3_SECRET_ACCESS_KEY,
    endpoint: parsed.data.S3_ENDPOINT,
    enabled: !!parsed.data.S3_BUCKET,
  },

  zarinpal: {
    merchantId: parsed.data.ZARINPAL_MERCHANT_ID,
    sandbox: parsed.data.ZARINPAL_SANDBOX === 'true',
    callbackUrl: parsed.data.ZARINPAL_CALLBACK_URL,
  },
  frontendUrl: parsed.data.FRONTEND_URL,
  exposeOtp: parsed.data.EXPOSE_OTP === 'true',
};
