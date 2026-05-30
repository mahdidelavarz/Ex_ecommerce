// src/modules/payments/payment.routes.ts
import { Router } from 'express';
import { PaymentController } from './payment.controller';
import { validate } from '../../middleware/validate';
import { authenticate, authorize } from '../../middleware/auth';
import { UserRole } from '../../shared/constants/enums';
import { createPaymentSchema, updatePaymentSchema } from './payment.validator';

const router = Router();
const controller = new PaymentController();

router.get('/order/:orderId', authenticate, controller.findByOrder);
router.get('/:id', authenticate, controller.getById);
router.post('/', authenticate, authorize(UserRole.ADMIN), validate({ body: createPaymentSchema }), controller.create);
router.patch('/:id', authenticate, authorize(UserRole.ADMIN), validate({ body: updatePaymentSchema }), controller.update);

export default router;