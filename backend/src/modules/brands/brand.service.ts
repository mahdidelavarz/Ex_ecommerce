// src/modules/brands/brand.service.ts
import { BrandRepository } from './brand.repository';
import { CreateBrandDto, UpdateBrandDto, BrandResponse, BrandMinimal } from './brand.types';

/**
 * @module Brands
 * @description Business logic for brand management.
 *
 * Public: list, get by id/slug, get all minimal
 * Admin: create, update, delete
 */
export class BrandService {
  private repo = new BrandRepository();

  async list(options: {
    search?: string;
    is_active?: boolean;
    page?: number;
    limit?: number;
    sort_by?: string;
    sort_order?: 'ASC' | 'DESC';
  }) {
    const page = options.page || 1;
    const limit = options.limit || 50;
    const sort_by = options.sort_by || 'name';
    const sort_order = options.sort_order || 'ASC';

    const { data, total } = await this.repo.findAll({
      search: options.search,
      is_active: options.is_active,
      page,
      limit,
      sort_by,
      sort_order,
    });

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getByIdOrSlug(idOrSlug: string): Promise<BrandResponse> {
    const brand = await this.repo.findByIdOrSlug(idOrSlug);
    return brand as unknown as BrandResponse;
  }

  async getAllMinimal(): Promise<BrandMinimal[]> {
    const brands = await this.repo.findAllMinimal();
    return brands as unknown as BrandMinimal[];
  }

  async create(dto: CreateBrandDto): Promise<BrandResponse> {
    const brand = await this.repo.create(dto);
    return brand as unknown as BrandResponse;
  }

  async update(id: string, dto: UpdateBrandDto): Promise<BrandResponse> {
    const brand = await this.repo.update(id, dto);
    return brand as unknown as BrandResponse;
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}