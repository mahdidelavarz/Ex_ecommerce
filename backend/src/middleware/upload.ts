// src/middleware/upload.ts
import multer, { StorageEngine } from 'multer';
import path from 'path';
import fs from 'fs';
import { env } from '../config/env';

function buildS3Storage(): StorageEngine {
  let S3Client: any;
  let multerS3: any;

  try {
    ({ S3Client } = require('@aws-sdk/client-s3'));
    multerS3 = require('multer-s3');
  } catch {
    throw new Error('S3 uploads require @aws-sdk/client-s3 and multer-s3 to be installed');
  }

  const s3 = new S3Client({
    region: env.s3.region,
    credentials: {
      accessKeyId: env.s3.accessKeyId!,
      secretAccessKey: env.s3.secretAccessKey!,
    },
    ...(env.s3.endpoint && { endpoint: env.s3.endpoint }),
  });

  return multerS3({
    s3,
    bucket: env.s3.bucket!,
    acl: 'public-read',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (_req: Express.Request, file: Express.Multer.File, cb: (error: Error | null, key?: string) => void) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
    },
  });
}

function buildDiskStorage(): StorageEngine {
  const dest = env.upload.path;
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

  return multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, dest),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
    },
  });
}

const storage = env.s3.enabled ? buildS3Storage() : buildDiskStorage();

export const uploadMiddleware = multer({
  storage,
  limits: { fileSize: env.upload.maxFileSize },
  fileFilter: (_req, file, cb) => {
    const allowed = /^image\/(jpeg|png|webp|gif)$/;
    if (allowed.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('فقط فایل‌های تصویری مجاز هستند (jpeg, png, webp, gif)'));
    }
  },
});

export function getFileUrl(file: Express.Multer.File): string {
  if (env.s3.enabled) {
    return (file as any).location;
  }
  return `/uploads/${file.filename}`;
}
