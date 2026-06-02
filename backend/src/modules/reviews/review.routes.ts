// src/modules/reviews/review.routes.ts
import { Router } from 'express';
import { ReviewController } from './review.controller';
import { validate } from '../../middleware/validate';
import { authenticate, authorize, optionalAuth } from '../../middleware/auth';
import { UserRole } from '../../shared/constants/enums';
import { createReviewSchema, updateReviewSchema } from './review.validator';

const router = Router();
const controller = new ReviewController();

router.get('/product/:productId', controller.productReviews);
router.post('/', authenticate, validate({ body: createReviewSchema }), controller.create);
router.patch('/:id', authenticate, validate({ body: updateReviewSchema }), controller.update);
router.delete('/:id', authenticate, controller.delete);
router.post('/:id/helpful', authenticate, controller.markHelpful);

router.get('/admin/all', authenticate, authorize(UserRole.ADMIN), controller.adminList);
router.patch('/:id/approve', authenticate, authorize(UserRole.ADMIN), controller.approve);
router.post('/:id/reply', authenticate, authorize(UserRole.ADMIN), controller.reply);

export default router;