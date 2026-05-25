// src/modules/tags/tag.routes.ts
import { Router } from 'express';
import { TagController } from './tag.controller';
import { validate } from '../../middleware/validate';
import { authenticate, authorize } from '../../middleware/auth';
import { UserRole } from '../../shared/constants/enums';
import { createTagSchema, updateTagSchema, tagQuerySchema } from './tag.validator';

const router = Router();
const controller = new TagController();

router.get('/', validate({ query: tagQuerySchema }), controller.list);
router.get('/all', controller.all);
router.get('/:id', controller.getById);
router.post('/', authenticate, authorize(UserRole.ADMIN), validate({ body: createTagSchema }), controller.create);
router.patch('/:id', authenticate, authorize(UserRole.ADMIN), validate({ body: updateTagSchema }), controller.update);
router.delete('/:id', authenticate, authorize(UserRole.ADMIN), controller.delete);

export default router;