// src/modules/attributes/attribute.routes.ts
import { Router } from 'express';
import { AttributeController } from './attribute.controller';
import { validate } from '../../middleware/validate';
import { authenticate, authorize } from '../../middleware/auth';
import { UserRole } from '../../shared/constants/enums';
import {
  createAttributeSchema,
  updateAttributeSchema,
  createValueSchema,
  updateValueSchema,
  attributeQuerySchema,
} from './attribute.validator';

const router = Router();
const controller = new AttributeController();

// Public
router.get('/', validate({ query: attributeQuerySchema }), controller.list);
router.get('/all', controller.all);
router.get('/:id', controller.getById);

// Admin - Attributes
router.post('/', authenticate, authorize(UserRole.ADMIN), validate({ body: createAttributeSchema }), controller.create);
router.patch('/:id', authenticate, authorize(UserRole.ADMIN), validate({ body: updateAttributeSchema }), controller.update);
router.delete('/:id', authenticate, authorize(UserRole.ADMIN), controller.delete);

// Admin - Values
router.post('/:id/values', authenticate, authorize(UserRole.ADMIN), validate({ body: createValueSchema }), controller.addValue);
router.patch('/values/:valueId', authenticate, authorize(UserRole.ADMIN), validate({ body: updateValueSchema }), controller.updateValue);
router.delete('/values/:valueId', authenticate, authorize(UserRole.ADMIN), controller.deleteValue);

export default router;