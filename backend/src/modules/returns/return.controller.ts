// src/modules/returns/return.controller.ts
import { Request, Response } from 'express';
import { ReturnService } from './return.service';
import { asyncHandler } from '../../middleware/asyncHandler';
import { ApiResponseHelper } from '../../shared/utils/response';

export class ReturnController {
  private service = new ReturnService();

  create = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.service.create(req.userId!, req.body);
    ApiResponseHelper.created(res, result);
  });

  list = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await this.service.findByUser(req.userId!, page, limit);
    ApiResponseHelper.paginated(res, result.items, result.total, page, limit);
  });

  getMyById = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.service.findByUserAndId(req.userId!, req.params.id);
    ApiResponseHelper.success(res, result);
  });

  adminList = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string | undefined;
    const { data, total } = await this.service.findAllAdmin({ page, limit, status });
    ApiResponseHelper.paginated(res, data, total, page, limit);
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.service.findByIdWithRelations(req.params.id);
    ApiResponseHelper.success(res, result);
  });

  updateStatus = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.service.updateStatus(req.params.id, req.body, req.userId);
    ApiResponseHelper.success(res, result);
  });
}
