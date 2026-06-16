// src/modules/brands/brand.controller.ts
import { Request, Response } from 'express';
import { BrandService } from './brand.service';
import { asyncHandler } from '../../middleware/asyncHandler';
import { ApiResponseHelper } from '../../shared/utils/response';

/**
 * @module Brands
 * @description Handles HTTP requests for brands.
 */
export class BrandController {
  private service = new BrandService();

  /**
   * GET /api/v1/brands - List brands (paginated, filterable)
   */
  list = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.service.list({
      search: req.query.search as string,
      is_active: req.query.is_active as boolean | undefined,
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      sort_by: req.query.sort_by as string,
      sort_order: req.query.sort_order as 'ASC' | 'DESC',
    });

    ApiResponseHelper.success(res, result.data, 'Brands fetched successfully', 200, result.meta);
  });

  /**
   * GET /api/v1/brands/all - Get all brands (minimal, for dropdowns)
   */
  all = asyncHandler(async (req: Request, res: Response) => {
    const brands = await this.service.getAllMinimal();
    ApiResponseHelper.success(res, brands);
  });

  /**
   * GET /api/v1/brands/:id - Get single brand
   */
  getById = asyncHandler(async (req: Request, res: Response) => {
    const brand = await this.service.getByIdOrSlug(req.params.id);
    ApiResponseHelper.success(res, brand);
  });

  /**
   * POST /api/v1/brands - Create brand (admin)
   */
  create = asyncHandler(async (req: Request, res: Response) => {
    const brand = await this.service.create(req.body);
    ApiResponseHelper.created(res, brand, 'برند با موفقیت ایجاد شد');
  });

  /**
   * PATCH /api/v1/brands/:id - Update brand (admin)
   */
  update = asyncHandler(async (req: Request, res: Response) => {
    const brand = await this.service.update(req.params.id, req.body);
    ApiResponseHelper.success(res, brand, 'برند با موفقیت بروزرسانی شد');
  });

  /**
   * GET /api/v1/brands/:slug/products - Products for a brand (public)
   */
  getProductsBySlug = asyncHandler(async (req: Request, res: Response) => {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = Math.min(req.query.limit ? parseInt(req.query.limit as string) : 20, 50);
    const result = await this.service.getProductsBySlug(req.params.slug, page, limit);
    ApiResponseHelper.success(res, result.data, 'Products fetched successfully', 200, result.meta);
  });

  /**
   * DELETE /api/v1/brands/:id - Delete brand (admin)
   */
  delete = asyncHandler(async (req: Request, res: Response) => {
    await this.service.delete(req.params.id);
    ApiResponseHelper.success(res, null, 'برند با موفقیت حذف شد');
  });
}