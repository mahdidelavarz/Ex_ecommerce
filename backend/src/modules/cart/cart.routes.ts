// src/modules/cart/cart.routes.ts
import { Router } from 'express';
import { CartController } from './cart.controller';
import { validate } from '../../middleware/validate';
import { authenticate, optionalAuth } from '../../middleware/auth';
import { addToCartSchema, updateCartItemSchema } from './cart.validator';

const router = Router();
const controller = new CartController();

// Use optionalAuth - allows both guest (session) and authenticated users
router.get('/', optionalAuth, controller.getCart);
router.post('/items', optionalAuth, validate({ body: addToCartSchema }), controller.addItem);
router.patch('/items/:itemId', optionalAuth, validate({ body: updateCartItemSchema }), controller.updateItem);
router.delete('/items/:itemId', optionalAuth, controller.removeItem);
router.delete('/', optionalAuth, controller.clearCart);
router.post('/merge', authenticate, controller.mergeCart);

export default router;