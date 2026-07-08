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

// Admin routes
router.get(
  '/admin',
  authenticate,
  authorize(UserRole.ADMIN),
  validate({ query: categoryQuerySchema }),
  controller.listAdmin
);

router.get(
  '/admin/tree',
  authenticate,
  authorize(UserRole.ADMIN),
  controller.treeAdmin
);

router.get(
  '/admin/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  controller.getByIdAdmin
);

// Public routes
router.get('/', validate({ query: categoryQuerySchema }), controller.list);
router.get('/tree', controller.tree);
router.get('/:slug/products', controller.getProductsBySlug);
router.get('/:id', controller.getById);

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
