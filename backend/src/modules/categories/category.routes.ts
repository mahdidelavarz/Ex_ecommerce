// src/modules/categories/category.routes.ts
import { Router } from 'express';
import { CategoryController } from './category.controller';
import { validate } from '../../middleware/validate';
import { authenticate, authorize } from '../../middleware/auth';
import { UserRole } from '../../shared/constants/enums';
import {
  createCategorySchema,
  updateCategorySchema,
  bulkSortSchema,
  categoryQuerySchema,
} from './category.validator';

const router = Router();
const controller = new CategoryController();

// Public routes
router.get('/', validate({ query: categoryQuerySchema }), controller.list);
router.get('/tree', controller.tree);
router.get('/:id', controller.getById);

// Admin routes
router.post(
  '/',
  authenticate,
  authorize(UserRole.ADMIN),
  validate({ body: createCategorySchema }),
  controller.create
);

router.patch(
  '/sort',
  authenticate,
  authorize(UserRole.ADMIN),
  validate({ body: bulkSortSchema }),
  controller.bulkSort
);

router.patch(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  validate({ body: updateCategorySchema }),
  controller.update
);

router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  controller.delete
);

export default router;