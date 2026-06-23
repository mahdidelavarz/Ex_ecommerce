// src/modules/variants/variant.controller.ts
import { Request, Response } from 'express';
import { VariantService } from './variant.service';
import { asyncHandler } from '../../middleware/asyncHandler';
import { ApiResponseHelper } from '../../shared/utils/response';

export class VariantController {
  private service = new VariantService();

  listByProduct = asyncHandler(async (req: Request, res: Response) => {
    const variants = await this.service.listByProduct(req.params.productId);
    ApiResponseHelper.success(res, variants);
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const variant = await this.service.getById(req.params.variantId);
    ApiResponseHelper.success(res, variant);
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const variant = await this.service.create(req.params.productId, req.body);
    ApiResponseHelper.created(res, variant, 'واریانت با موفقیت ایجاد شد');
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const variant = await this.service.update(req.params.variantId, req.body);
    ApiResponseHelper.success(res, variant, 'واریانت بروزرسانی شد');
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    await this.service.delete(req.params.variantId);
    ApiResponseHelper.success(res, null, 'واریانت حذف شد');
  });

  bulkStock = asyncHandler(async (req: Request, res: Response) => {
    await this.service.bulkStock(req.body, req.userId);
    ApiResponseHelper.success(res, null, 'موجودی بروزرسانی شد');
  });

  addImage = asyncHandler(async (req: Request, res: Response) => {
    const image = await this.service.addImage(req.params.variantId, req.body);
    ApiResponseHelper.created(res, image, 'تصویر اضافه شد');
  });

  deleteImage = asyncHandler(async (req: Request, res: Response) => {
    await this.service.deleteImage(req.params.imageId);
    ApiResponseHelper.success(res, null, 'تصویر حذف شد');
  });
}