// src/modules/orders/order.controller.ts
import { Response } from 'express';
import { Request } from 'express';
import { OrderService } from './order.service';
import { asyncHandler } from '../../middleware/asyncHandler';
import { ApiResponseHelper } from '../../shared/utils/response';

export class OrderController {
  private service = new OrderService();

  create = asyncHandler(async (req: Request, res: Response) => {
    const order = await this.service.create(req.userId!, req.body);
    ApiResponseHelper.created(res, order, 'سفارش با موفقیت ثبت شد');
  });

  myOrders = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.service.findByUser(req.userId!, {
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      status: req.query.status as string,
    });
    ApiResponseHelper.success(res, result.data, undefined, 200, result.meta);
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const order = await this.service.findById(req.params.id, req.userId!);
    ApiResponseHelper.success(res, order);
  });

  cancel = asyncHandler(async (req: Request, res: Response) => {
    const order = await this.service.cancelOrder(req.params.id, req.userId!);
    ApiResponseHelper.success(res, order, 'سفارش لغو شد');
  });

  adminList = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.service.findAllAdmin(req.query);
    ApiResponseHelper.success(res, result.data, undefined, 200, result.meta);
  });

  updateStatus = asyncHandler(async (req: Request, res: Response) => {
    const order = await this.service.updateStatus(req.params.id, req.body);
    ApiResponseHelper.success(res, order, 'وضعیت بروزرسانی شد');
  });
}