// src/modules/returns/return.routes.ts
import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { UserRole } from '../../database/entities/user.entity';
import { validate } from '../../middleware/validate';
import { createReturnSchema, updateReturnStatusSchema, returnIdParamSchema } from './return.validator';
import { ReturnController } from './return.controller';

const router = Router();
const controller = new ReturnController();

router.post('/', authenticate, validate({ body: createReturnSchema }), controller.create);
router.get('/', authenticate, controller.list);
router.get('/my/:id', authenticate, validate({ params: returnIdParamSchema }), controller.getMyById);

// Admin routes — must come before /:id to avoid param collision
router.get('/admin/all', authenticate, authorize(UserRole.ADMIN), controller.adminList);
router.get('/:id', authenticate, authorize(UserRole.ADMIN), validate({ params: returnIdParamSchema }), controller.getById);
router.patch('/:id/status', authenticate, authorize(UserRole.ADMIN), validate({ params: returnIdParamSchema, body: updateReturnStatusSchema }), controller.updateStatus);

export default router;
