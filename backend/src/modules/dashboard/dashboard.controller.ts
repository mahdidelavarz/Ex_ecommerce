// src/modules/dashboard/dashboard.controller.ts
import { Request, Response } from 'express';
import { DashboardService } from './dashboard.service';
import { asyncHandler } from '../../middleware/asyncHandler';
import { ApiResponseHelper } from '../../shared/utils/response';

export class DashboardController {
  private service = new DashboardService();

  stats = asyncHandler(async (_req: Request, res: Response) => {
    const stats = await this.service.getStats();
    ApiResponseHelper.success(res, stats);
  });
}
