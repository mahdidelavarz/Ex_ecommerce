// src/modules/categories/category.repository.ts
import { AppDataSource } from "../../config/database";
import { Category } from "../../database/entities/category.entity";
import { Product } from "../../database/entities/product.entity";
import {
  NotFoundError,
  ConflictError,
  BadRequestError,
} from "../../shared/utils/errors";
import { CreateCategoryDto, UpdateCategoryDto } from "./category.types";

export class CategoryRepository {
  private repo = AppDataSource.getRepository(Category);
  private productRepo = AppDataSource.getRepository(Product);

  async findAll(options: {
    parent_id?: string | null;
    is_active?: boolean;
    search?: string;
    page: number;
    limit: number;
    sort_by: string;
    sort_order: "ASC" | "DESC";
  }) {
    const qb = this.repo
      .createQueryBuilder("category")
      .leftJoin("category.children", "children")
      .leftJoin("category.products", "products")
      .select([
        "category",
        "COUNT(DISTINCT children.id) as children_count",
        "COUNT(DISTINCT products.id) as products_count",
      ])
      .groupBy("category.id");

    if (options.parent_id !== undefined) {
      if (options.parent_id === null) {
        qb.andWhere("category.parent_id IS NULL");
      } else {
        qb.andWhere("category.parent_id = :parent_id", {
          parent_id: options.parent_id,
        });
      }
    }

    if (options.is_active !== undefined) {
      qb.andWhere("category.is_active = :is_active", {
        is_active: options.is_active,
      });
    }

    if (options.search) {
      qb.andWhere(
        "(category.name ILIKE :search OR category.description ILIKE :search)",
        { search: `%${options.search}%` },
      );
    }

    qb.orderBy(`category.${options.sort_by}`, options.sort_order);
    qb.skip((options.page - 1) * options.limit);
    qb.take(options.limit);

    const [data, total] = await qb.getManyAndCount();

    return { data, total };
  }

  async findByIdOrSlug(idOrSlug: string) {
    const isUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        idOrSlug,
      );

    const category = await this.repo.findOne({
      where: isUUID ? { id: idOrSlug } : { slug: idOrSlug },
      relations: ["parent", "children"],
    });

    if (!category) {
      throw new NotFoundError("دسته‌بندی مورد نظر یافت نشد");
    }

    // Get products count
    const productsCount = await this.productRepo.count({
      where: { category_id: category.id },
    });

    return { category, productsCount };
  }

  async getTree() {
    const categories = await this.repo.find({
      where: { is_active: true },
      order: { sort_order: "ASC", name: "ASC" },
    });

    return this.buildTree(categories);
  }

  async create(dto: CreateCategoryDto) {
    // Generate slug from name
    const slug = await this.generateUniqueSlug(dto.name);

    // Check circular reference
    if (dto.parent_id) {
      await this.validateParent(dto.parent_id);
    }

    const category = this.repo.create({
      ...dto,
      slug,
    });

    return this.repo.save(category);
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const category = await this.repo.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundError("دسته‌بندی مورد نظر یافت نشد");
    }

    // If name changed, regenerate slug
    if (dto.name && dto.name !== category.name) {
      (dto as any).slug = await this.generateUniqueSlug(dto.name, id);
    }

    // Check circular reference
    if (dto.parent_id) {
      if (dto.parent_id === id) {
        throw new BadRequestError("یک دسته‌بندی نمی‌تواند والد خودش باشد");
      }
      await this.validateParent(dto.parent_id, id);
    }

    Object.assign(category, dto);
    return this.repo.save(category);
  }
  async delete(id: string, force: boolean = false) {
    const category = await this.repo.findOne({
      where: { id },
      relations: ["children", "products"],
    });

    if (!category) {
      throw new NotFoundError("دسته‌بندی مورد نظر یافت نشد");
    }

    // Check if has children
    if (category.children && category.children.length > 0 && !force) {
      throw new ConflictError(
        "این دسته‌بندی دارای زیرمجموعه است. برای حذف از force=true استفاده کنید",
      );
    }

    // Check if has products
    if (category.products && category.products.length > 0) {
      throw new ConflictError(
        "این دسته‌بندی دارای محصول است و نمی‌توان آن را حذف کرد",
      );
    }

    // If force, delete children first
    if (force && category.children) {
      for (const child of category.children) {
        await this.delete(child.id, true);
      }
    }

    await this.repo.remove(category);
  }

  async bulkSort(dtos: Array<{ id: string; sort_order: number }>) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const item of dtos) {
        await queryRunner.manager.update(Category, item.id, {
          sort_order: item.sort_order,
        });
      }
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getProductsBySlug(slug: string, page: number, limit: number) {
    const category = await this.repo.findOne({ where: { slug } });
    if (!category) throw new NotFoundError('دسته‌بندی یافت نشد');

    const childIds = await this.getAllChildrenIds(category.id);
    const allIds = [category.id, ...childIds];

    const [products, total] = await this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.brand', 'brand')
      .where('product.category_id IN (:...ids)', { ids: allIds })
      .andWhere('product.is_active = true')
      .andWhere('product.is_public = true')
      .orderBy('product.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { products, total };
  }

  // Private helpers
  private async generateUniqueSlug(
    name: string,
    excludeId?: string,
  ): Promise<string> {
    let slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();

    // Check uniqueness
    let counter = 1;
    let uniqueSlug = slug;
    while (true) {
      const qb = this.repo
        .createQueryBuilder("category")
        .where("category.slug = :slug", { slug: uniqueSlug });

      if (excludeId) {
        qb.andWhere("category.id != :id", { id: excludeId });
      }

      const exists = await qb.getOne();
      if (!exists) break;

      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }

    return uniqueSlug;
  }

  private async validateParent(parent_id: string, currentId?: string) {
    const parent = await this.repo.findOne({ where: { id: parent_id } });
    if (!parent) {
      throw new NotFoundError("دسته‌بندی والد یافت نشد");
    }

    // Check circular reference: the chosen parent must not be one of this
    // category's own descendants (which would create a loop in the tree).
    if (currentId) {
      const descendants = await this.getAllChildrenIds(currentId);
      if (descendants.includes(parent_id)) {
        throw new BadRequestError(
          "یک دسته‌بندی نمی‌تواند زیرمجموعه خودش قرار گیرد",
        );
      }
    }
  }

  private async getAllChildrenIds(categoryId: string): Promise<string[]> {
    const rows: { id: string }[] = await this.repo.query(
      `WITH RECURSIVE tree AS (
         SELECT id FROM categories WHERE parent_id = $1
         UNION ALL
         SELECT c.id FROM categories c INNER JOIN tree t ON c.parent_id = t.id
       )
       SELECT id FROM tree`,
      [categoryId],
    );
    return rows.map((r) => r.id);
  }

  private buildTree(categories: Category[]): any[] {
    const map = new Map<string, any>();
    const roots: any[] = [];

    categories.forEach((cat) => {
      map.set(cat.id, {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        parent_id: cat.parent_id,
        description: cat.description,
        image: cat.image,
        icon: cat.icon,
        color: cat.color,
        sort_order: cat.sort_order,
        is_active: cat.is_active,
        children: [],
      });
    });

    categories.forEach((cat) => {
      const node = map.get(cat.id);
      if (cat.parent_id && map.has(cat.parent_id)) {
        map.get(cat.parent_id).children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }
}
