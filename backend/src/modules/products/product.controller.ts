// src/modules/products/product.controller.ts
import { Request, Response } from "express";
import { ProductService } from "./product.service";
import { asyncHandler } from "../../middleware/asyncHandler";
import { ApiResponseHelper } from "../../shared/utils/response";

export class ProductController {
  private service = new ProductService();

  list = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.service.list({
      category_id: req.query.category_id as string,
      brand_id: req.query.brand_id as string,
      tag: req.query.tag as string,
      search: req.query.search as string,
      min_price: req.query.min_price
        ? parseFloat(req.query.min_price as string)
        : undefined,
      max_price: req.query.max_price
        ? parseFloat(req.query.max_price as string)
        : undefined,
      is_active: req.query.is_active as any,
      is_public: req.query.is_public as any,
      has_stock: req.query.has_stock === "true",
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      sort_by: req.query.sort_by as string,
      sort_order: req.query.sort_order as "ASC" | "DESC",
    });
    ApiResponseHelper.success(res, result.data, undefined, 200, result.meta);
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const product = await this.service.getById(req.params.id);
    ApiResponseHelper.success(res, product);
  });

  getBySlug = asyncHandler(async (req: Request, res: Response) => {
    const product = await this.service.getBySlug(req.params.slug);
    ApiResponseHelper.success(res, product);
  });

  getRelated = asyncHandler(async (req: Request, res: Response) => {
    const products = await this.service.getRelated(
      req.params.slug,
      parseInt(req.query.limit as string) || 8,
    );
    ApiResponseHelper.success(res, products);
  });

  getFilters = asyncHandler(async (req: Request, res: Response) => {
    const filters = await this.service.getFilters(
      req.query.category_id as string,
    );
    ApiResponseHelper.success(res, filters);
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const product = await this.service.create(req.body);
    ApiResponseHelper.created(res, product, "محصول با موفقیت ایجاد شد");
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const product = await this.service.update(req.params.id, req.body);
    ApiResponseHelper.success(res, product, "محصول با موفقیت بروزرسانی شد");
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    await this.service.softDelete(req.params.id);
    ApiResponseHelper.success(res, null, "محصول با موفقیت حذف شد");
  });

  bulkStatus = asyncHandler(async (req: Request, res: Response) => {
    await this.service.bulkStatus(req.body.ids, req.body.is_active);
    ApiResponseHelper.success(res, null, "وضعیت محصولات بروزرسانی شد");
  });

  addImage = asyncHandler(async (req: Request, res: Response) => {
    const image = await this.service.addImage(req.params.id, req.body);
    ApiResponseHelper.created(res, image, "تصویر اضافه شد");
  });

  deleteImage = asyncHandler(async (req: Request, res: Response) => {
    await this.service.deleteImage(req.params.imageId);
    ApiResponseHelper.success(res, null, "تصویر حذف شد");
  });

  syncTags = asyncHandler(async (req: Request, res: Response) => {
    await this.service.syncTags(req.params.id, req.body.tag_ids);
    ApiResponseHelper.success(res, null, "برچسب‌ها بروزرسانی شدند");
  });
}
