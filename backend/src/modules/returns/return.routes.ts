// src/modules/returns/return.routes.ts
import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { ReturnRepository } from './return.repository';
import { UserRole } from '@/database/entities/user.entity';

const router = Router();
const repo = new ReturnRepository();

router.post('/', authenticate, async (req, res) => {
  const ret = await repo.create(req.userId!, req.body);
  res.status(201).json({ success: true, data: ret });
});

router.get('/', authenticate, async (req, res) => {
  const returns = await repo.findByUser(req.userId!);
  res.json({ success: true, data: returns });
});



// Admin routes
router.get('/admin/all', authenticate, authorize(UserRole.ADMIN), async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const status = req.query.status as string;
  const { data, total } = await repo.findAllAdmin({ page, limit, status });
  res.json({ success: true, data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

router.get('/:id', authenticate, authorize(UserRole.ADMIN), async (req, res) => {
  const ret = await repo.findByIdWithRelations(req.params.id);
  res.json({ success: true, data: ret });
});

router.patch('/:id/status', authenticate, authorize(UserRole.ADMIN), async (req, res) => {
  const ret = await repo.updateStatus(req.params.id, req.body);
  res.json({ success: true, data: ret });
});
export default router;