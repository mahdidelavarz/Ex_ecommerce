// src/modules/payments/payment.controller.ts
import { Request, Response } from 'express';
import { PaymentService } from './payment.service';
import { asyncHandler } from '../../middleware/asyncHandler';
import { ApiResponseHelper } from '../../shared/utils/response';

export class PaymentController {
  private service = new PaymentService();

  findByOrder = asyncHandler(async (req: Request, res: Response) => {
    const payments = await this.service.findByOrder(req.params.orderId);
    ApiResponseHelper.success(res, payments);
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const payment = await this.service.findById(req.params.id);
    ApiResponseHelper.success(res, payment);
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const payment = await this.service.create(req.body);
    ApiResponseHelper.created(res, payment, 'پرداخت ایجاد شد');
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const payment = await this.service.update(req.params.id, req.body);
    ApiResponseHelper.success(res, payment, 'وضعیت پرداخت بروزرسانی شد');
  });

  initiate = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.service.initiate(req.body.order_id, req.userId!);
    ApiResponseHelper.success(res, result);
  });

  verify = asyncHandler(async (req: Request, res: Response) => {
    const { Authority = '', Status = '', order_id = '' } = req.query as Record<string, string>;
    const redirectUrl = await this.service.verify(Authority, Status, order_id);
    return res.redirect(redirectUrl);
  });
}
