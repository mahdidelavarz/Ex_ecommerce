// src/modules/wishlist/wishlist.controller.ts
import { Request, Response } from 'express';
import { WishlistService } from './wishlist.service';
import { asyncHandler } from '../../middleware/asyncHandler';
import { ApiResponseHelper } from '../../shared/utils/response';

export class WishlistController {
  private service = new WishlistService();

  list = asyncHandler(async (req: Request, res: Response) => {
    const items = await this.service.list(req.userId!);
    ApiResponseHelper.success(res, items);
  });

  add = asyncHandler(async (req: Request, res: Response) => {
    await this.service.add(req.userId!, req.body);
    ApiResponseHelper.created(res, null, 'به علاقه‌مندی‌ها اضافه شد');
  });

  remove = asyncHandler(async (req: Request, res: Response) => {
    await this.service.remove(req.userId!, req.params.id);
    ApiResponseHelper.success(res, null, 'از علاقه‌مندی‌ها حذف شد');
  });

  check = asyncHandler(async (req: Request, res: Response) => {
    const isWishlisted = await this.service.check(req.userId!, req.params.variantId);
    ApiResponseHelper.success(res, { is_wishlisted: isWishlisted });
  });
}