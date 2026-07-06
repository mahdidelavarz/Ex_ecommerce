// src/config/cors.ts
import cors from 'cors';
import { env } from './env';

export const corsConfig = cors({
  origin: env.cors.origin,
  credentials: true,  // ← حتماً true
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Cache-Control',
    'Pragma',
    'x-session-id',
  ],
  exposedHeaders: ['Set-Cookie'],  // ← اینو اضافه کن
});
