// src/modules/settings/setting.routes.ts
import { Router } from 'express';
import { SettingController } from './setting.controller';
import { validate } from '../../middleware/validate';
import { authenticate, authorize } from '../../middleware/auth';
import { UserRole } from '../../shared/constants/enums';
import { upsertSettingSchema } from './setting.validator';

const router = Router();
const controller = new SettingController();

// Public — storefront footer / contact / about read whitelisted public settings.
// Must be registered before '/:key' so it isn't captured as a key param.
router.get('/public', controller.publicMap);

// Public — checkout needs shipping_cost without authentication
router.get('/:key', controller.getByKey);

// Admin only
router.get('/', authenticate, authorize(UserRole.ADMIN), controller.list);
router.patch(
  '/:key',
  authenticate,
  authorize(UserRole.ADMIN),
  validate({ body: upsertSettingSchema }),
  controller.upsert
);

export default router;
