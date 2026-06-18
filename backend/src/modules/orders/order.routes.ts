// src/modules/orders/order.routes.ts
import { Router } from 'express';
import { OrderController } from './order.controller';
import { validate } from '../../middleware/validate';
import { authenticate, authorize } from '../../middleware/auth';
import { UserRole } from '../../shared/constants/enums';
import { createOrderSchema, updateStatusSchema } from './order.validator';

const router = Router();
const controller = new OrderController();

// Admin (must come before /:id to avoid Express matching 'admin' as an id)
router.get('/admin/all', authenticate, authorize(UserRole.ADMIN), controller.adminList);
router.patch('/:id/status', authenticate, authorize(UserRole.ADMIN), validate({ body: updateStatusSchema }), controller.updateStatus);

// Customer
router.post('/', authenticate, validate({ body: createOrderSchema }), controller.create);
router.get('/', authenticate, controller.myOrders);
router.get('/:id', authenticate, controller.getById);
router.post('/:id/cancel', authenticate, controller.cancel);

export default router;