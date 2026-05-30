// src/modules/shipments/shipment.controller.ts
import { Request, Response } from 'express';
import { ShipmentService } from './shipment.service';
import { asyncHandler } from '../../middleware/asyncHandler';
import { ApiResponseHelper } from '../../shared/utils/response';

export class ShipmentController {
  private service = new ShipmentService();
  findByOrder = asyncHandler(async (req: Request, res: Response) => { ApiResponseHelper.success(res, await this.service.findByOrder(req.params.orderId)); });
  getById = asyncHandler(async (req: Request, res: Response) => { ApiResponseHelper.success(res, await this.service.findById(req.params.id)); });
  create = asyncHandler(async (req: Request, res: Response) => { ApiResponseHelper.created(res, await this.service.create(req.body), 'ارسال ایجاد شد'); });
  update = asyncHandler(async (req: Request, res: Response) => { ApiResponseHelper.success(res, await this.service.update(req.params.id, req.body), 'بروزرسانی شد'); });
}