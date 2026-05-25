// src/modules/coupons/coupon.controller.ts
import { Request, Response } from 'express';
import { CouponService } from './coupon.service';
import { asyncHandler } from '../../middleware/asyncHandler';
import { ApiResponseHelper } from '../../shared/utils/response';

export class CouponController {
  private service = new CouponService();

  list = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.service.list({
      search: req.query.search as string,
      is_active: req.query.is_active === 'true' ? true : req.query.is_active === 'false' ? false : undefined,
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
    });
    ApiResponseHelper.success(res, result.data, undefined, 200, result.meta);
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const coupon = await this.service.getById(req.params.id);
    ApiResponseHelper.success(res, coupon);
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const coupon = await this.service.create(req.body);
    ApiResponseHelper.created(res, coupon, 'کد تخفیف ایجاد شد');
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const coupon = await this.service.update(req.params.id, req.body);
    ApiResponseHelper.success(res, coupon, 'کد تخفیف بروزرسانی شد');
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    await this.service.delete(req.params.id);
    ApiResponseHelper.success(res, null, 'کد تخفیف حذف شد');
  });

  validate = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.service.validate(req.body, req.userId!);
    ApiResponseHelper.success(res, result);
  });
}