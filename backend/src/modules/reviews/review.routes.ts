// src/modules/reviews/review.routes.ts
import { Router } from 'express';
import { ReviewController } from './review.controller';
import { validate } from '../../middleware/validate';
import { authenticate, authorize, optionalAuth } from '../../middleware/auth';
import { UserRole } from '../../shared/constants/enums';
import {
  createReviewSchema,
  updateReviewSchema,
  approveReviewSchema,
  replyReviewSchema,
} from './review.validator';

const router = Router();
const controller = new ReviewController();

// Public / optional-auth
router.get('/product/:productId', optionalAuth, controller.productReviews);
router.get('/product/:productId/can-review', authenticate, controller.canReview);

// User routes
router.post('/', authenticate, validate({ body: createReviewSchema }), controller.create);
router.patch('/:id', authenticate, validate({ body: updateReviewSchema }), controller.update);
router.delete('/:id', authenticate, controller.delete);
router.post('/:id/helpful', authenticate, controller.markHelpful);

// Admin routes
router.get('/admin/all', authenticate, authorize(UserRole.ADMIN), controller.adminList);
router.delete('/admin/:id', authenticate, authorize(UserRole.ADMIN), controller.adminDelete);
router.patch('/:id/approve', authenticate, authorize(UserRole.ADMIN), validate({ body: approveReviewSchema }), controller.approve);
router.post('/:id/reply', authenticate, authorize(UserRole.ADMIN), validate({ body: replyReviewSchema }), controller.reply);

export default router;
