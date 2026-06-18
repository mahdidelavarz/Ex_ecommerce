// src/modules/auth/auth.routes.ts
import { Router } from 'express';
import { AuthController } from './auth.controller';
import { AddressController } from './address.controller';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';
import { authLimiter } from '../../middleware/rateLimiter';
import {
  sendOtpSchema,
  verifyOtpSchema,
  completeProfileSchema,
  updateProfileSchema,
} from './auth.validation';

const router = Router();
const authController = new AuthController();
const addressController = new AddressController();

// Public routes (with rate limiting)
router.post('/send-otp', authLimiter, validate({ body: sendOtpSchema }), authController.sendOTP);
router.post('/verify-otp', authLimiter, validate({ body: verifyOtpSchema }), authController.verifyOTP);
router.post('/refresh', authController.refreshToken);

// Protected routes
router.get('/me', authenticate, authController.getCurrentUser);
router.post('/logout', authenticate, authController.logout);
router.put('/profile', authenticate, validate({ body: completeProfileSchema }), authController.completeProfile);
router.patch('/profile', authenticate, validate({ body: updateProfileSchema }), authController.updateProfile);
router.delete('/account', authenticate, authController.deleteAccount);
router.get('/sessions', authenticate, authController.getSessions);
router.delete('/sessions/:id', authenticate, authController.revokeSession);

// Address management
router.get('/addresses', authenticate, addressController.list);
router.post('/addresses', authenticate, addressController.create);
router.delete('/addresses/:id', authenticate, addressController.delete);

export default router;