// src/modules/cart/cart.controller.ts
import { Request, Response } from 'express';
import { CartService } from './cart.service';
import { asyncHandler } from '../../middleware/asyncHandler';
import { ApiResponseHelper } from '../../shared/utils/response';

export class CartController {
  private service = new CartService();

  getCart = asyncHandler(async (req: Request, res: Response) => {
    const cart = await this.service.getCart(
      req.userId || '',
      (req.headers['x-session-id'] as string) || undefined
    );
    ApiResponseHelper.success(res, cart);
  });

  addItem = asyncHandler(async (req: Request, res: Response) => {
    const cart = await this.service.addItem(
      req.userId || '',
      req.body,
      (req.headers['x-session-id'] as string) || undefined
    );
    ApiResponseHelper.created(res, cart, 'به سبد خرید اضافه شد');
  });

  updateItem = asyncHandler(async (req: Request, res: Response) => {
    await this.service.updateItem(req.params.itemId, req.body);
    ApiResponseHelper.success(res, null, 'تعداد بروزرسانی شد');
  });

  removeItem = asyncHandler(async (req: Request, res: Response) => {
    await this.service.removeItem(req.params.itemId);
    ApiResponseHelper.success(res, null, 'از سبد خرید حذف شد');
  });

  clearCart = asyncHandler(async (req: Request, res: Response) => {
    await this.service.clearCart(
      req.userId || '',
      (req.headers['x-session-id'] as string) || undefined
    );
    ApiResponseHelper.success(res, null, 'سبد خرید خالی شد');
  });

  mergeCart = asyncHandler(async (req: Request, res: Response) => {
    await this.service.mergeCart(req.userId!, req.body.session_id);
    ApiResponseHelper.success(res, null, 'سبد خرید ادغام شد');
  });
}