// src/modules/shipments/shipment.controller.ts
import { Request, Response } from 'express';
import { ShipmentService } from './shipment.service';
import { asyncHandler } from '../../middleware/asyncHandler';
import { ApiResponseHelper } from '../../shared/utils/response';
import { UserRole } from '../../shared/constants/enums';
import { ShipmentStatus } from '../../database/entities/shipment.entity';

export class ShipmentController {
  private service = new ShipmentService();

  // Admin: paginated list of all shipments with order context
  list = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.service.list({
      status: req.query.status as ShipmentStatus | undefined,
      search: req.query.search as string,
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
    });
    ApiResponseHelper.success(res, result.data, undefined, 200, result.meta);
  });

  // SHP-B1: admins bypass ownership check; customers get their own orders only
  findByOrder = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.role === UserRole.ADMIN ? undefined : req.userId;
    ApiResponseHelper.success(res, await this.service.findByOrder(req.params.orderId, userId));
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.role === UserRole.ADMIN ? undefined : req.userId;
    ApiResponseHelper.success(res, await this.service.findById(req.params.id, userId));
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    ApiResponseHelper.created(res, await this.service.create(req.body), 'ارسال ایجاد شد');
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    ApiResponseHelper.success(res, await this.service.update(req.params.id, req.body), 'بروزرسانی شد');
  });
}
