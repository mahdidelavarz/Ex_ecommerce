// src/modules/tags/tag.controller.ts
import { Request, Response } from 'express';
import { TagService } from './tag.service';
import { asyncHandler } from '../../middleware/asyncHandler';
import { ApiResponseHelper } from '../../shared/utils/response';

export class TagController {
  private service = new TagService();

  list = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.service.list({
      search: req.query.search as string,
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
    });
    ApiResponseHelper.success(res, result.data, undefined, 200, result.meta);
  });

  all = asyncHandler(async (req: Request, res: Response) => {
    const tags = await this.service.getAllMinimal();
    ApiResponseHelper.success(res, tags);
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const tag = await this.service.getById(req.params.id);
    ApiResponseHelper.success(res, tag);
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const tag = await this.service.create(req.body);
    ApiResponseHelper.created(res, tag, 'تگ با موفقیت ایجاد شد');
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const tag = await this.service.update(req.params.id, req.body);
    ApiResponseHelper.success(res, tag, 'تگ بروزرسانی شد');
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    await this.service.delete(req.params.id);
    ApiResponseHelper.success(res, null, 'تگ حذف شد');
  });
}