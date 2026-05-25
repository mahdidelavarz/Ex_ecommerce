// src/modules/attributes/attribute.controller.ts
import { Request, Response } from 'express';
import { AttributeService } from './attribute.service';
import { asyncHandler } from '../../middleware/asyncHandler';
import { ApiResponseHelper } from '../../shared/utils/response';

export class AttributeController {
  private service = new AttributeService();

  list = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.service.list({
      search: req.query.search as string,
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
    });
    ApiResponseHelper.success(res, result.data, undefined, 200, result.meta);
  });

  all = asyncHandler(async (req: Request, res: Response) => {
    const attributes = await this.service.getAllMinimal();
    ApiResponseHelper.success(res, attributes);
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const attribute = await this.service.getById(req.params.id);
    ApiResponseHelper.success(res, attribute);
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const attribute = await this.service.create(req.body);
    ApiResponseHelper.created(res, attribute, 'ویژگی با موفقیت ایجاد شد');
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const attribute = await this.service.update(req.params.id, req.body);
    ApiResponseHelper.success(res, attribute, 'ویژگی بروزرسانی شد');
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    await this.service.delete(req.params.id);
    ApiResponseHelper.success(res, null, 'ویژگی حذف شد');
  });

  addValue = asyncHandler(async (req: Request, res: Response) => {
    const value = await this.service.addValue(req.params.id, req.body);
    ApiResponseHelper.created(res, value, 'مقدار اضافه شد');
  });

  updateValue = asyncHandler(async (req: Request, res: Response) => {
    const value = await this.service.updateValue(req.params.valueId, req.body);
    ApiResponseHelper.success(res, value, 'مقدار بروزرسانی شد');
  });

  deleteValue = asyncHandler(async (req: Request, res: Response) => {
    await this.service.deleteValue(req.params.valueId);
    ApiResponseHelper.success(res, null, 'مقدار حذف شد');
  });
}