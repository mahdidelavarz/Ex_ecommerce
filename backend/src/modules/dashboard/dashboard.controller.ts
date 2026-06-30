// src/modules/dashboard/dashboard.controller.ts
import { Request, Response } from 'express';
import { DashboardService, DashboardPeriod } from './dashboard.service';
import { asyncHandler } from '../../middleware/asyncHandler';
import { ApiResponseHelper } from '../../shared/utils/response';

const VALID_PERIODS: DashboardPeriod[] = ['7d', '30d', 'month', 'all'];

function parsePeriod(value: unknown): DashboardPeriod {
  return VALID_PERIODS.includes(value as DashboardPeriod)
    ? (value as DashboardPeriod)
    : '30d';
}

export class DashboardController {
  private service = new DashboardService();

  stats = asyncHandler(async (req: Request, res: Response) => {
    const stats = await this.service.getStats(parsePeriod(req.query.period));
    ApiResponseHelper.success(res, stats);
  });

  salesSeries = asyncHandler(async (req: Request, res: Response) => {
    const series = await this.service.getSalesSeries(parsePeriod(req.query.period));
    ApiResponseHelper.success(res, series);
  });

  topProducts = asyncHandler(async (req: Request, res: Response) => {
    const products = await this.service.getTopProducts(parsePeriod(req.query.period));
    ApiResponseHelper.success(res, products);
  });

  lowStock = asyncHandler(async (_req: Request, res: Response) => {
    const variants = await this.service.getLowStockVariants();
    ApiResponseHelper.success(res, variants);
  });
}
