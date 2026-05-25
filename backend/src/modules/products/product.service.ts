// src/modules/products/product.service.ts
import { NotFoundError } from "@/shared/utils/errors";
import { ProductRepository } from "./product.repository";
import {
  CreateProductDto,
  UpdateProductDto,
  ProductQueryParams,
} from "./product.types";

export class ProductService {
  private repo = new ProductRepository();

  async list(options: ProductQueryParams) {
    const { data, total } = await this.repo.findAll(options);
    return {
      data,
      meta: {
        page: options.page || 1,
        limit: Math.min(options.limit || 20, 50),
        total,
        totalPages: Math.ceil(total / Math.min(options.limit || 20, 50)),
      },
    };
  }

  async getById(id: string) {
    return this.repo.findById(id);
  }

  async getBySlug(slug: string) {
    return this.repo.findBySlug(slug);
  }

  async getRelated(slug: string, limit?: number) {
    return this.repo.findRelated(slug, limit);
  }

  async getFilters(categoryId: string) {
    return this.repo.getFilters(categoryId);
  }

  async create(dto: CreateProductDto) {
    return this.repo.create(dto);
  }

  async update(id: string, dto: UpdateProductDto) {
    return this.repo.update(id, dto);
  }

  async softDelete(id: string) {
    return this.repo.softDelete(id);
  }

  async bulkStatus(ids: string[], is_active: boolean) {
    return this.repo.bulkStatus(ids, is_active);
  }

  async addImage(productId: string, dto: any) {
    return this.repo.addImage(productId, dto);
  }

  async deleteImage(imageId: string) {
    return this.repo.deleteImage(imageId);
  }

  async syncTags(productId: string, tag_ids: string[]) {
    return this.repo.syncTags(productId, tag_ids);
  }
}
