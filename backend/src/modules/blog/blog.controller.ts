// src/modules/blog/blog.controller.ts
import { Request, Response } from 'express';
import { BlogService } from './blog.service';
import { asyncHandler } from '../../middleware/asyncHandler';
import { ApiResponseHelper } from '../../shared/utils/response';
import { BlogQueryParams } from './blog.types';

/**
 * @module Blog
 * @description Handles HTTP requests for blog posts.
 */
export class BlogController {
  private service = new BlogService();

  /** GET /api/v1/blog-posts - Public list (published only) */
  list = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.service.list({
      search: req.query.search as string,
      tag: req.query.tag as string,
      is_published: true,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      sort_by: req.query.sort_by as BlogQueryParams['sort_by'],
      sort_order: req.query.sort_order as 'ASC' | 'DESC',
    });
    ApiResponseHelper.success(res, result.data, 'Blog posts fetched successfully', 200, result.meta);
  });

  /** GET /api/v1/blog-posts/admin - Admin list (incl. drafts) */
  adminList = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.service.list({
      search: req.query.search as string,
      tag: req.query.tag as string,
      is_published: req.query.is_published as boolean | undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      sort_by: req.query.sort_by as BlogQueryParams['sort_by'],
      sort_order: req.query.sort_order as 'ASC' | 'DESC',
    });
    ApiResponseHelper.success(res, result.data, 'Blog posts fetched successfully', 200, result.meta);
  });

  /** GET /api/v1/blog-posts/admin/:id - Admin single post (incl. drafts) */
  adminGetById = asyncHandler(async (req: Request, res: Response) => {
    const post = await this.service.getByIdAdmin(req.params.id);
    ApiResponseHelper.success(res, post);
  });

  /** GET /api/v1/blog-posts/:slug - Public detail (+ views, related) */
  getBySlug = asyncHandler(async (req: Request, res: Response) => {
    const post = await this.service.getBySlug(req.params.slug);
    ApiResponseHelper.success(res, post);
  });

  /** POST /api/v1/blog-posts - Create (admin) */
  create = asyncHandler(async (req: Request, res: Response) => {
    const post = await this.service.create(req.body, req.userId ?? null);
    ApiResponseHelper.created(res, post, 'مطلب با موفقیت ایجاد شد');
  });

  /** PATCH /api/v1/blog-posts/:id - Update (admin) */
  update = asyncHandler(async (req: Request, res: Response) => {
    const post = await this.service.update(req.params.id, req.body);
    ApiResponseHelper.success(res, post, 'مطلب با موفقیت بروزرسانی شد');
  });

  /** DELETE /api/v1/blog-posts/:id - Soft delete (admin) */
  delete = asyncHandler(async (req: Request, res: Response) => {
    await this.service.delete(req.params.id);
    ApiResponseHelper.success(res, null, 'مطلب با موفقیت حذف شد');
  });
}
