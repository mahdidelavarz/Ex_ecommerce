// src/modules/variants/variant.routes.ts
import { Router } from 'express';
import { VariantController } from './variant.controller';
import { validate } from '../../middleware/validate';
import { authenticate, authorize } from '../../middleware/auth';
import { UserRole } from '../../shared/constants/enums';
import { createVariantSchema, updateVariantSchema, bulkStockSchema } from './variant.validator';

const router = Router();
const controller = new VariantController();

// Public
router.get('/products/:productId/variants', controller.listByProduct);

// Admin
router.post('/products/:productId/variants', authenticate, authorize(UserRole.ADMIN), validate({ body: createVariantSchema }), controller.create);
router.get('/products/variants/:variantId', authenticate, authorize(UserRole.ADMIN), controller.getById);
router.patch('/products/variants/:variantId', authenticate, authorize(UserRole.ADMIN), validate({ body: updateVariantSchema }), controller.update);
router.delete('/products/variants/:variantId', authenticate, authorize(UserRole.ADMIN), controller.delete);
router.patch('/products/variants/stock', authenticate, authorize(UserRole.ADMIN), validate({ body: bulkStockSchema }), controller.bulkStock);
router.post('/products/variants/:variantId/images', authenticate, authorize(UserRole.ADMIN), controller.addImage);
router.delete('/products/variants/images/:imageId', authenticate, authorize(UserRole.ADMIN), controller.deleteImage);

export default router;