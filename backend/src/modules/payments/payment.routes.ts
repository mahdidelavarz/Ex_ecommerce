// src/modules/payments/payment.routes.ts
import { Router } from 'express';
import { PaymentController } from './payment.controller';
import { validate } from '../../middleware/validate';
import { authenticate, authorize } from '../../middleware/auth';
import { UserRole } from '../../shared/constants/enums';
import { createPaymentSchema, updatePaymentSchema, initiatePaymentSchema } from './payment.validator';

const router = Router();
const controller = new PaymentController();

// Customer: initiate payment for own order
router.post('/initiate', authenticate, validate({ body: initiatePaymentSchema }), controller.initiate);

// Public: Zarinpal gateway callback — no auth, called by gateway redirect
router.get('/verify', controller.verify);

router.get('/order/:orderId', authenticate, controller.findByOrder);
router.get('/:id', authenticate, controller.getById);
router.post('/', authenticate, authorize(UserRole.ADMIN), validate({ body: createPaymentSchema }), controller.create);
router.patch('/:id', authenticate, authorize(UserRole.ADMIN), validate({ body: updatePaymentSchema }), controller.update);

export default router;
