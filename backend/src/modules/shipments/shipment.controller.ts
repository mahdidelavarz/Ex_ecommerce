// src/modules/shipments/shipment.controller.ts
import { Request, Response } from 'express';
import { ShipmentService } from './shipment.service';
import { asyncHandler } from '../../middleware/asyncHandler';
import { ApiResponseHelper } from '../../shared/utils/response';
import { UserRole } from '../../shared/constants/enums';

export class ShipmentController {
  private service = new ShipmentService();

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
