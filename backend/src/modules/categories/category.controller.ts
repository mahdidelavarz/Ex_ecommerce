// src/modules/categories/category.controller.ts
import { Request, Response } from 'express';
import { CategoryService } from './category.service';
import { asyncHandler } from '../../middleware/asyncHandler';
import { ApiResponseHelper } from '../../shared/utils/response';

/**
 * @module Categories
 * @description Handles HTTP requests for categories.
 */
export class CategoryController {
  private service = new CategoryService();

  /**
   * GET /api/v1/categories - List categories (paginated, filterable)
   */
  list = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.service.list({
      parent_id: req.query.parent_id as string | null,
      is_active: true,
      has_image: req.query.has_image as boolean | undefined,
      search: req.query.search as string,
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      sort_by: req.query.sort_by as string,
      sort_order: req.query.sort_order as 'ASC' | 'DESC',
    });

    ApiResponseHelper.success(res, result.data, 'Categories fetched successfully', 200, result.meta);
  });

  /**
   * GET /api/v1/categories/admin - Admin list, including inactive categories.
   */
  listAdmin = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.service.list({
      parent_id: req.query.parent_id as string | null,
      is_active: req.query.is_active as boolean | undefined,
      has_image: req.query.has_image as boolean | undefined,
      search: req.query.search as string,
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      sort_by: req.query.sort_by as string,
      sort_order: req.query.sort_order as 'ASC' | 'DESC',
    });

    ApiResponseHelper.success(res, result.data, 'Categories fetched successfully', 200, result.meta);
  });

  /**
   * GET /api/v1/categories/tree - Get full category tree
   */
  tree = asyncHandler(async (req: Request, res: Response) => {
    const tree = await this.service.getTree();
    ApiResponseHelper.success(res, tree);
  });

  /**
   * GET /api/v1/categories/admin/tree - Admin tree, including inactive categories.
   */
  treeAdmin = asyncHandler(async (req: Request, res: Response) => {
    const tree = await this.service.getTree(true);
    ApiResponseHelper.success(res, tree);
  });

  /**
   * GET /api/v1/categories/:id - Get single category
   */
  getById = asyncHandler(async (req: Request, res: Response) => {
    const category = await this.service.getByIdOrSlug(req.params.id);
    ApiResponseHelper.success(res, category);
  });

  /**
   * GET /api/v1/categories/admin/:id - Admin single category.
   */
  getByIdAdmin = asyncHandler(async (req: Request, res: Response) => {
    const category = await this.service.getByIdOrSlug(req.params.id, true);
    ApiResponseHelper.success(res, category);
  });

  /**
   * POST /api/v1/categories - Create category (admin)
   */
  create = asyncHandler(async (req: Request, res: Response) => {
    const category = await this.service.create(req.body);
    ApiResponseHelper.created(res, category, 'دسته‌بندی با موفقیت ایجاد شد');
  });

  /**
   * PATCH /api/v1/categories/:id - Update category (admin)
   */
  update = asyncHandler(async (req: Request, res: Response) => {
    const category = await this.service.update(req.params.id, req.body);
    ApiResponseHelper.success(res, category, 'دسته‌بندی با موفقیت بروزرسانی شد');
  });

  /**
   * DELETE /api/v1/categories/:id - Delete category (admin)
   */
  delete = asyncHandler(async (req: Request, res: Response) => {
    const force = req.query.force === 'true';
    await this.service.delete(req.params.id, force);
    ApiResponseHelper.success(res, null, 'دسته‌بندی با موفقیت حذف شد');
  });

  /**
   * GET /api/v1/categories/:slug/products - Products for a category (public)
   */
  getProductsBySlug = asyncHandler(async (req: Request, res: Response) => {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = Math.min(req.query.limit ? parseInt(req.query.limit as string) : 20, 50);
    const result = await this.service.getProductsBySlug(req.params.slug, page, limit);
    ApiResponseHelper.success(res, result.data, 'Products fetched successfully', 200, result.meta);
  });

  /**
   * PATCH /api/v1/categories/sort - Bulk sort update (admin)
   */
  bulkSort = asyncHandler(async (req: Request, res: Response) => {
    await this.service.bulkSort(req.body);
    ApiResponseHelper.success(res, null, 'ترتیب با موفقیت بروزرسانی شد');
  });
}
