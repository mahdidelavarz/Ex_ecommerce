// src/modules/wishlist/wishlist.routes.ts
import { Router } from 'express';
import { WishlistController } from './wishlist.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();
const controller = new WishlistController();

router.get('/', authenticate, controller.list);
router.post('/', authenticate, controller.add);
router.delete('/:id', authenticate, controller.remove);
router.get('/check/:variantId', authenticate, controller.check);

export default router;