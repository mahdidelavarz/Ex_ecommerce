// src/modules/products/product.routes.ts
import { Router } from 'express';
import { ProductController } from './product.controller';
import { validate } from '../../middleware/validate';
import { authenticate, authorize } from '../../middleware/auth';
import { UserRole } from '../../shared/constants/enums';
import { createProductSchema, updateProductSchema, bulkStatusSchema, productQuerySchema } from './product.validator';

const router = Router();
const controller = new ProductController();

// Public routes
router.get('/', validate({ query: productQuerySchema }), controller.list);
router.get('/filters', controller.getFilters);
router.get('/id/:id', controller.getById);
router.get('/:slug', controller.getBySlug);
router.get('/:slug/related', controller.getRelated);

// Admin routes
router.post('/', authenticate, authorize(UserRole.ADMIN), validate({ body: createProductSchema }), controller.create);
router.patch('/bulk-status', authenticate, authorize(UserRole.ADMIN), validate({ body: bulkStatusSchema }), controller.bulkStatus);
router.patch('/:id', authenticate, authorize(UserRole.ADMIN), validate({ body: updateProductSchema }), controller.update);
router.delete('/:id', authenticate, authorize(UserRole.ADMIN), controller.delete);
router.post('/:id/images', authenticate, authorize(UserRole.ADMIN), controller.addImage);
router.delete('/:id/images/:imageId', authenticate, authorize(UserRole.ADMIN), controller.deleteImage);
router.post('/:id/tags', authenticate, authorize(UserRole.ADMIN), controller.syncTags);

export default router;