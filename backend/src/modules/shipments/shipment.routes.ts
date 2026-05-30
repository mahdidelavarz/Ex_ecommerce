// src/modules/shipments/shipment.routes.ts
import { Router } from 'express';
import { ShipmentController } from './shipment.controller';
import { authenticate, authorize } from '../../middleware/auth';
import { UserRole } from '../../shared/constants/enums';

const router = Router();
const controller = new ShipmentController();

router.get('/order/:orderId', authenticate, controller.findByOrder);
router.get('/:id', authenticate, controller.getById);
router.post('/', authenticate, authorize(UserRole.ADMIN), controller.create);
router.patch('/:id', authenticate, authorize(UserRole.ADMIN), controller.update);

export default router;