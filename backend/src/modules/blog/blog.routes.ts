// src/modules/blog/blog.routes.ts
import { Router } from 'express';
import { BlogController } from './blog.controller';
import { validate } from '../../middleware/validate';
import { authenticate, authorize } from '../../middleware/auth';
import { UserRole } from '../../shared/constants/enums';
import {
  createBlogSchema,
  updateBlogSchema,
  blogQuerySchema,
} from './blog.validator';

const router = Router();
const controller = new BlogController();

// Admin routes (registered before "/:slug" so "admin" isn't treated as a slug)
router.get(
  '/admin',
  authenticate,
  authorize(UserRole.ADMIN),
  validate({ query: blogQuerySchema }),
  controller.adminList,
);

router.get(
  '/admin/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  controller.adminGetById,
);

// Public routes
router.get('/', validate({ query: blogQuerySchema }), controller.list);
router.get('/:slug', controller.getBySlug);

// Admin mutations
router.post(
  '/',
  authenticate,
  authorize(UserRole.ADMIN),
  validate({ body: createBlogSchema }),
  controller.create,
);

router.patch(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  validate({ body: updateBlogSchema }),
  controller.update,
);

router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  controller.delete,
);

export default router;
