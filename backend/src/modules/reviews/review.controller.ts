// src/modules/reviews/review.controller.ts
import { Request, Response } from 'express';
import { ReviewService } from './review.service';
import { asyncHandler } from '../../middleware/asyncHandler';
import { ApiResponseHelper } from '../../shared/utils/response';

export class ReviewController {
  private service = new ReviewService();

  productReviews = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.service.findByProduct(req.params.productId, {
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      sort_by: req.query.sort_by as string,
    });
    ApiResponseHelper.success(res, result.reviews, undefined, 200, {
      page: 1, limit: 10, total: result.total, totalPages: Math.ceil(result.total / 10),
      avg_rating: result.avg_rating,
      rating_distribution: result.rating_distribution,
    } as any);
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const review = await this.service.create(req.userId!, req.body);
    ApiResponseHelper.created(res, review, 'نظر شما ثبت شد');
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const review = await this.service.update(req.params.id, req.userId!, req.body);
    ApiResponseHelper.success(res, review, 'نظر بروزرسانی شد');
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    await this.service.delete(req.params.id, req.userId!);
    ApiResponseHelper.success(res, null, 'نظر حذف شد');
  });

  markHelpful = asyncHandler(async (req: Request, res: Response) => {
    const review = await this.service.markHelpful(req.params.id);
    ApiResponseHelper.success(res, { helpful_count: review.helpful_count });
  });

  adminList = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.service.findAllAdmin(req.query);
    ApiResponseHelper.success(res, result.data, undefined, 200, result.meta);
  });

  approve = asyncHandler(async (req: Request, res: Response) => {
    const review = await this.service.approve(req.params.id, req.body.is_approved);
    ApiResponseHelper.success(res, review);
  });

  reply = asyncHandler(async (req: Request, res: Response) => {
    const review = await this.service.reply(req.params.id, req.body.admin_reply);
    ApiResponseHelper.success(res, review, 'پاسخ ثبت شد');
  });
}