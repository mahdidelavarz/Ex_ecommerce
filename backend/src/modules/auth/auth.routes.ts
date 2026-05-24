// src/modules/auth/auth.routes.ts
import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';
import { authLimiter } from '../../middleware/rateLimiter';
import {
  sendOtpSchema,
  verifyOtpSchema,
  refreshTokenSchema,
  completeProfileSchema,
  updateProfileSchema,
} from './auth.validation';

const router = Router();
const authController = new AuthController();

// Public routes (with rate limiting)
router.post('/send-otp', authLimiter, validate({ body: sendOtpSchema }), authController.sendOTP);
router.post('/verify-otp', authLimiter, validate({ body: verifyOtpSchema }), authController.verifyOTP);
router.post('/refresh', validate({ body: refreshTokenSchema }), authController.refreshToken);
router.get('/callback', authController.googleCallback);

// Protected routes
router.get('/me', authenticate, authController.getCurrentUser);
router.post('/logout', authenticate, authController.logout);
router.put('/profile', authenticate, validate({ body: completeProfileSchema }), authController.completeProfile);
router.patch('/profile', authenticate, validate({ body: updateProfileSchema }), authController.updateProfile);
router.post('/make-admin', authController.makeAdmin); // فقط برای dev


export default router;