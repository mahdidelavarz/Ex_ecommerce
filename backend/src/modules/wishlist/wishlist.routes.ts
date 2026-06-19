// src/modules/wishlist/wishlist.routes.ts
import { Router } from 'express';
import { WishlistController } from './wishlist.controller';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { addToWishlistSchema, wishlistIdParamSchema, variantIdParamSchema } from './wishlist.validator';

const router = Router();
const controller = new WishlistController();

router.get('/', authenticate, controller.list);
router.post('/', authenticate, validate({ body: addToWishlistSchema }), controller.add);
router.delete('/:id', authenticate, validate({ params: wishlistIdParamSchema }), controller.remove);
router.get('/check/:variantId', authenticate, validate({ params: variantIdParamSchema }), controller.check);

export default router;
