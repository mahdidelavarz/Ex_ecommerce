// src/modules/dashboard/dashboard.routes.ts
import { Router } from 'express';
import { DashboardController } from './dashboard.controller';
import { authenticate, authorize } from '../../middleware/auth';
import { UserRole } from '../../shared/constants/enums';

const router = Router();
const controller = new DashboardController();

router.get('/stats', authenticate, authorize(UserRole.ADMIN), controller.stats);
router.get('/low-stock', authenticate, authorize(UserRole.ADMIN), controller.lowStock);

export default router;
