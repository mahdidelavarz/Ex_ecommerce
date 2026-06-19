// src/modules/wishlist/wishlist.controller.ts
import { Request, Response } from 'express';
import { WishlistService } from './wishlist.service';
import { asyncHandler } from '../../middleware/asyncHandler';
import { ApiResponseHelper } from '../../shared/utils/response';

export class WishlistController {
  private service = new WishlistService();

  list = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await this.service.list(req.userId!, page, limit);
    ApiResponseHelper.paginated(res, result.items, result.total, page, limit);
  });

  add = asyncHandler(async (req: Request, res: Response) => {
    const item = await this.service.add(req.userId!, req.body);
    ApiResponseHelper.created(res, item, 'به علاقه‌مندی‌ها اضافه شد');
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
