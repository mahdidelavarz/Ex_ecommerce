// src/modules/brands/brand.routes.ts
import { Router } from 'express';
import { BrandController } from './brand.controller';
import { validate } from '../../middleware/validate';
import { authenticate, authorize } from '../../middleware/auth';
import { UserRole } from '../../shared/constants/enums';
import {
  createBrandSchema,
  updateBrandSchema,
  brandQuerySchema,
} from './brand.validator';

const router = Router();
const controller = new BrandController();

// Public routes
router.get('/', validate({ query: brandQuerySchema }), controller.list);
router.get('/all', controller.all);
router.get('/:id', controller.getById);

// Admin routes
router.post(
  '/',
  authenticate,
  authorize(UserRole.ADMIN),
  validate({ body: createBrandSchema }),
  controller.create
);

router.patch(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  validate({ body: updateBrandSchema }),
  controller.update
);

router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  controller.delete
);

export default router;