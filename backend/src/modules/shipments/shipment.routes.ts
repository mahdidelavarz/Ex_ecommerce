// src/modules/shipments/shipment.routes.ts
import { Router } from 'express';
import { ShipmentController } from './shipment.controller';
import { validate } from '../../middleware/validate';
import { authenticate, authorize } from '../../middleware/auth';
import { UserRole } from '../../shared/constants/enums';
import { createShipmentSchema, updateShipmentSchema } from './shipment.validator';

const router = Router();
const controller = new ShipmentController();

router.get('/order/:orderId', authenticate, controller.findByOrder);
router.get('/:id', authenticate, controller.getById);
router.post('/', authenticate, authorize(UserRole.ADMIN), validate({ body: createShipmentSchema }), controller.create);
router.patch('/:id', authenticate, authorize(UserRole.ADMIN), validate({ body: updateShipmentSchema }), controller.update);

export default router;
