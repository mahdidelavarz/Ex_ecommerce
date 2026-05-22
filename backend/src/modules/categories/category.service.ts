// src/modules/categories/category.service.ts
import { CategoryRepository } from './category.repository';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  BulkSortDto,
  CategoryListResponse,
  CategoryTreeNode,
} from './category.types';

/**
 * @module Categories
 * @description Business logic for category management.
 *
 * Public: list, get by id/slug, tree
 * Admin: create, update, delete, bulk sort
 */
export class CategoryService {
  private repo = new CategoryRepository();

  async list(options: {
    parent_id?: string | null;
    is_active?: boolean;
    search?: string;
    page?: number;
    limit?: number;
    sort_by?: string;
    sort_order?: 'ASC' | 'DESC';
  }) {
    const page = options.page || 1;
    const limit = options.limit || 50;
    const sort_by = options.sort_by || 'sort_order';
    const sort_order = options.sort_order || 'ASC';

    const { data, total } = await this.repo.findAll({
      ...options,
      page,
      limit,
      sort_by,
      sort_order,
    });

    return {
      data: data.map((cat: any) => ({
        id: cat.id,
        parent_id: cat.parent_id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        image: cat.image,
        icon: cat.icon,
        color: cat.color,
        sort_order: cat.sort_order,
        is_active: cat.is_active,
        children_count: parseInt(cat.children_count) || 0,
        products_count: parseInt(cat.products_count) || 0,
        created_at: cat.created_at,
        updated_at: cat.updated_at,
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getByIdOrSlug(idOrSlug: string) {
    const { category, productsCount } = await this.repo.findByIdOrSlug(idOrSlug);

    return {
      id: category.id,
      parent_id: category.parent_id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      image: category.image,
      icon: category.icon,
      color: category.color,
      sort_order: category.sort_order,
      is_active: category.is_active,
      parent: category.parent
        ? {
            id: category.parent.id,
            name: category.parent.name,
            slug: category.parent.slug,
          }
        : null,
      children: category.children?.map((child) => ({
        id: child.id,
        name: child.name,
        slug: child.slug,
        image: child.image,
      })),
      products_count: productsCount,
      seo: {
        title: category.seo_title,
        description: category.seo_description,
      },
    };
  }

  async getTree() {
    return this.repo.getTree();
  }

  async create(dto: CreateCategoryDto) {
    return this.repo.create(dto);
  }

  async update(id: string, dto: UpdateCategoryDto) {
    return this.repo.update(id, dto);
  }

  async delete(id: string, force: boolean = false) {
    await this.repo.delete(id, force);
  }

  async bulkSort(dto: BulkSortDto) {
    await this.repo.bulkSort(dto.items);
  }
}