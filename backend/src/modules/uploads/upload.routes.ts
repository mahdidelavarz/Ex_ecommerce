// src/modules/uploads/upload.routes.ts
import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { UserRole } from '../../shared/constants/enums';
import { uploadMiddleware, getFileUrl } from '../../middleware/upload';
import { asyncHandler } from '../../middleware/asyncHandler';
import { ApiResponseHelper } from '../../shared/utils/response';
import { BadRequestError } from '../../shared/utils/errors';

const router = Router();

/**
 * POST /api/v1/uploads
 * Admin-only single image upload. Returns an absolute URL so the value can be
 * stored directly as an image_url and rendered by the frontend.
 */
router.post(
  '/',
  authenticate,
  authorize(UserRole.ADMIN),
  uploadMiddleware.single('file'),
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      throw new BadRequestError('فایلی ارسال نشده است');
    }

    const url = getFileUrl(req.file);
    // Disk storage returns a relative "/uploads/..." path; make it absolute so
    // it works when rendered from a different origin (the frontend). S3 already
    // returns an absolute URL.
    const absoluteUrl = url.startsWith('http')
      ? url
      : `${req.protocol}://${req.get('host')}${url}`;

    ApiResponseHelper.created(res, { url: absoluteUrl }, 'فایل با موفقیت بارگذاری شد');
  })
);

export default router;
