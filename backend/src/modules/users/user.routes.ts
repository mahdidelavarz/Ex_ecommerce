// src/modules/users/user.routes.ts
import { Router } from 'express';
import { UserController } from './user.controller';
import { validate } from '../../middleware/validate';
import { authenticate, authorize } from '../../middleware/auth';
import { UserRole } from '../../shared/constants/enums';
import { userQuerySchema, updateRoleSchema, updateStatusSchema } from './user.validator';

const router = Router();
const controller = new UserController();

router.use(authenticate, authorize(UserRole.ADMIN));

router.get('/', validate({ query: userQuerySchema }), controller.list);
router.get('/:id', controller.getById);
router.patch('/:id/role', validate({ body: updateRoleSchema }), controller.updateRole);
router.patch('/:id/status', validate({ body: updateStatusSchema }), controller.updateStatus);

export default router;
