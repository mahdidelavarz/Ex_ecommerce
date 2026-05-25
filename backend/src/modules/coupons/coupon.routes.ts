// src/modules/coupons/coupon.routes.ts
import { Router } from 'express';
import { CouponController } from './coupon.controller';
import { validate } from '../../middleware/validate';
import { authenticate, authorize } from '../../middleware/auth';
import { UserRole } from '../../shared/constants/enums';
import { createCouponSchema, updateCouponSchema, validateCouponSchema } from './coupon.validator';

const router = Router();
const controller = new CouponController();

// Admin
router.get('/', authenticate, authorize(UserRole.ADMIN), controller.list);
router.get('/:id', authenticate, authorize(UserRole.ADMIN), controller.getById);
router.post('/', authenticate, authorize(UserRole.ADMIN), validate({ body: createCouponSchema }), controller.create);
router.patch('/:id', authenticate, authorize(UserRole.ADMIN), validate({ body: updateCouponSchema }), controller.update);
router.delete('/:id', authenticate, authorize(UserRole.ADMIN), controller.delete);

// Public (validate at checkout)
router.post('/validate', authenticate, validate({ body: validateCouponSchema }), controller.validate);

export default router;