// src/modules/settings/setting.controller.ts
import { Request, Response } from 'express';
import { SettingService } from './setting.service';
import { asyncHandler } from '../../middleware/asyncHandler';
import { ApiResponseHelper } from '../../shared/utils/response';

export class SettingController {
  private service = new SettingService();

  list = asyncHandler(async (_req: Request, res: Response) => {
    const settings = await this.service.list();
    ApiResponseHelper.success(res, settings);
  });

  getByKey = asyncHandler(async (req: Request, res: Response) => {
    const setting = await this.service.getByKey(req.params.key);
    ApiResponseHelper.success(res, setting);
  });

  upsert = asyncHandler(async (req: Request, res: Response) => {
    const setting = await this.service.upsert(req.params.key, req.body.value);
    ApiResponseHelper.success(res, setting);
  });
}
