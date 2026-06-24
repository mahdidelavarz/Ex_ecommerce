// src/modules/products/product.repository.ts
import { AppDataSource } from "../../config/database";
import { Product } from "../../database/entities/product.entity";
import { ProductImage } from "../../database/entities/product-image.entity";
import { ProductVariant } from "../../database/entities/product-variant.entity";
import { Category } from "../../database/entities/category.entity";
import { Brand } from "../../database/entities/brand.entity";
import { Tag } from "../../database/entities/tag.entity";
import { ProductTag } from "../../database/entities/product-tag.entity";
import { NotFoundError, BadRequestError } from "../../shared/utils/errors";
import {
  CreateProductDto,
  UpdateProductDto,
  ProductQueryParams,
} from "./product.types";
import { In } from "typeorm";

export class ProductRepository {
  private repo = AppDataSource.getRepository(Product);
  private imageRepo = AppDataSource.getRepository(ProductImage);
  private variantRepo = AppDataSource.getRepository(ProductVariant);
  private categoryRepo = AppDataSource.getRepository(Category);
  private brandRepo = AppDataSource.getRepository(Brand);
  private tagRepo = AppDataSource.getRepository(Tag);
  private productTagRepo = AppDataSource.getRepository(ProductTag);

  async findAll(options: ProductQueryParams) {
    const page = options.page || 1;
    const limit = Math.min(options.limit || 20, 50);
    const sort_by = options.sort_by || "created_at";
    const sort_order = options.sort_order || "DESC";

    const qb = this.repo
      .createQueryBuilder("product")
      .leftJoinAndSelect("product.category", "category")
      .leftJoinAndSelect("product.brand", "brand")
      .leftJoin("product.images", "images", "images.is_thumbnail = true")
      .addSelect("images.image_url", "thumbnail")
      .leftJoin("product.variants", "variants", "variants.is_active = true")
      .addSelect("MIN(variants.price)", "min_price")
      .addSelect("MAX(variants.price)", "max_price")
      .addSelect("SUM(variants.stock_quantity)", "total_stock")
      .addSelect("COUNT(DISTINCT variants.id)", "variants_count")
      .addSelect(
        `BOOL_OR(variants.compare_at_price IS NOT NULL AND variants.compare_at_price > variants.price)`,
        "has_discount",
      )
      .where("product.deleted_at IS NULL")
      .groupBy("product.id")
      .addGroupBy("category.id")
      .addGroupBy("brand.id")
      .addGroupBy("images.id");

    if (options.is_active !== undefined) {
      qb.andWhere("product.is_active = :is_active", {
        is_active: options.is_active,
      });
    }

    if (options.is_public !== undefined) {
      qb.andWhere("product.is_public = :is_public", {
        is_public: options.is_public,
      });
    }

    if (options.category_id) {
      // Include children categories
      const childIds = await this.getCategoryChildrenIds(options.category_id);
      qb.andWhere("product.category_id IN (:...categoryIds)", {
        categoryIds: [options.category_id, ...childIds],
      });
    }

    if (options.brand_id) {
      qb.andWhere("product.brand_id = :brand_id", {
        brand_id: options.brand_id,
      });
    }

    if (options.tag) {
      qb.innerJoin('product.product_tags', 'pt_tag')
        .innerJoin('pt_tag.tag', 'tag_filter', 'tag_filter.slug = :tagSlug', { tagSlug: options.tag });
    }

    if (options.search) {
      qb.andWhere(
        "(product.title ILIKE :search OR product.short_description ILIKE :search)",
        { search: `%${options.search}%` },
      );
    }

    if (options.min_price !== undefined || options.max_price !== undefined) {
      qb.having("MIN(variants.price) >= :minPrice", {
        minPrice: options.min_price || 0,
      });
      if (options.max_price) {
        qb.andHaving("MAX(variants.price) <= :maxPrice", {
          maxPrice: options.max_price,
        });
      }
    }

    if (options.has_stock) {
      qb.andHaving("SUM(variants.stock_quantity) > 0");
    }

    // Sort
    if (sort_by === "price") {
      qb.orderBy("min_price", sort_order);
    } else if (sort_by === "stock") {
      qb.orderBy("total_stock", sort_order);
    } else {
      qb.orderBy(`product.${sort_by}`, sort_order);
    }

    qb.skip((page - 1) * limit);
    qb.take(limit);

    // The thumbnail/aggregate columns are added via addSelect with custom
    // aliases, which getMany()/getManyAndCount() do NOT map onto entities.
    // Read them from the aligned raw rows (one row per product via groupBy).
    const total = await qb.getCount();
    const { entities, raw } = await qb.getRawAndEntities();

    return {
      data: entities.map((p: any, i: number) => {
        const r: any = raw[i] ?? {};
        return {
          id: p.id,
          title: p.title,
          slug: p.slug,
          short_description: p.short_description,
          category: p.category
            ? { id: p.category.id, name: p.category.name, slug: p.category.slug }
            : null,
          brand: p.brand
            ? {
                id: p.brand.id,
                name: p.brand.name,
                slug: p.brand.slug,
                logo: p.brand.logo,
              }
            : null,
          thumbnail: r.thumbnail ?? null,
          price_range: {
            min: parseFloat(r.min_price) || 0,
            max: parseFloat(r.max_price) || 0,
          },
          total_stock: parseInt(r.total_stock) || 0,
          variants_count: parseInt(r.variants_count) || 0,
          has_discount: r.has_discount === true || r.has_discount === "t",
          avg_rating: 0,
          reviews_count: 0,
          is_active: p.is_active,
          is_public: p.is_public,
          created_at: p.created_at,
        };
      }),
      total,
    };
  }

  async findById(id: string) {
    const product = await this.repo.findOne({
      where: { id, deleted_at: null as any },
      relations: [
        "category",
        "brand",
        "images",
        "variants",
        "variants.images",
        "variants.variant_attribute_values",
        "variants.variant_attribute_values.attribute_value",
        "variants.variant_attribute_values.attribute_value.attribute",
        "product_tags",
        "product_tags.tag",
      ],
    });

    if (!product) {
      throw new NotFoundError("محصول مورد نظر یافت نشد");
    }

    return this.formatProductDetail(product);
  }

  async findBySlug(slug: string) {
    const product = await this.repo.findOne({
      where: { slug, deleted_at: null as any },
      relations: [
        "category",
        "brand",
        "images",
        "variants",
        "variants.images",
        "variants.variant_attribute_values",
        "variants.variant_attribute_values.attribute_value",
        "variants.variant_attribute_values.attribute_value.attribute",
        "product_tags",
        "product_tags.tag",
      ],
    });

    if (!product) {
      throw new NotFoundError("محصول مورد نظر یافت نشد");
    }

    return this.formatProductDetail(product);
  }

  async findRelated(slug: string, limit: number = 8) {
    const product = await this.repo.findOne({ where: { slug } });
    if (!product) return [];

    const qb = this.repo
      .createQueryBuilder("product")
      .leftJoinAndSelect("product.category", "category")
      .leftJoinAndSelect("product.brand", "brand")
      .leftJoin("product.images", "images", "images.is_thumbnail = true")
      .addSelect("images.image_url", "thumbnail")
      .where("product.category_id = :categoryId", {
        categoryId: product.category_id,
      })
      .andWhere("product.id != :id", { id: product.id })
      .andWhere("product.is_active = true")
      .andWhere("product.is_public = true")
      .andWhere("product.deleted_at IS NULL")
      .orderBy("RANDOM()")
      .take(limit);

    // thumbnail is a custom addSelect alias, not mapped onto entities — read
    // it from the aligned raw rows.
    const { entities, raw } = await qb.getRawAndEntities();
    return entities.map((p: any, i: number) => ({
      ...p,
      thumbnail: raw[i]?.thumbnail ?? null,
    }));
  }

  async getFilters(categoryId: string) {
    // Brands
    const brandsQb = this.brandRepo
      .createQueryBuilder("brand")
      .leftJoin("brand.products", "product")
      .select([
        "brand.id",
        "brand.name",
        "brand.slug",
        "brand.logo",
        "COUNT(product.id) as count",
      ])
      .where("product.category_id = :categoryId", { categoryId })
      .andWhere("product.is_active = true")
      .andWhere("product.deleted_at IS NULL")
      .groupBy("brand.id")
      .orderBy("count", "DESC");

    const brands = await brandsQb.getMany();

    // Price range
    const priceRange = await this.variantRepo
      .createQueryBuilder("variant")
      .leftJoin("variant.product", "product")
      .select("MIN(variant.price)", "min")
      .addSelect("MAX(variant.price)", "max")
      .where("product.category_id = :categoryId", { categoryId })
      .andWhere("product.is_active = true")
      .getRawOne();

    return {
      brands: brands.map((b: any) => ({ ...b, count: parseInt(b.count) })),
      price_range: {
        min: parseFloat(priceRange?.min) || 0,
        max: parseFloat(priceRange?.max) || 0,
      },
      attributes: {},
    };
  }

  async create(dto: CreateProductDto) {
    const slug = await this.generateUniqueSlug(dto.title);

    // Validate category
    const category = await this.categoryRepo.findOne({
      where: { id: dto.category_id },
    });
    if (!category) throw new NotFoundError("دسته‌بندی یافت نشد");

    // Validate brand
    if (dto.brand_id) {
      const brand = await this.brandRepo.findOne({
        where: { id: dto.brand_id },
      });
      if (!brand) throw new NotFoundError("برند یافت نشد");
    }

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const product = this.repo.create({
        category_id: dto.category_id,
        brand_id: dto.brand_id || null,
        title: dto.title,
        slug,
        short_description: dto.short_description,
        full_description: dto.full_description,
        specification: dto.specification,
        seo_title: dto.seo_title,
        seo_description: dto.seo_description,
        is_active: dto.is_active ?? false,
        is_public: dto.is_public ?? false,
      });

      const savedProduct = await queryRunner.manager.save(product);

      // Save images
      if (dto.images?.length) {
        const images = dto.images.map((img, index) =>
          this.imageRepo.create({
            product_id: savedProduct.id,
            image_url: img.image_url,
            alt_text: img.alt_text || null,
            is_thumbnail: img.is_thumbnail ?? index === 0,
            sort_order: img.sort_order ?? index,
          }),
        );
        await queryRunner.manager.save(images);
      }

      // Save tags
      if (dto.tag_ids?.length) {
        const productTags = dto.tag_ids.map((tagId) =>
          this.productTagRepo.create({
            product_id: savedProduct.id,
            tag_id: tagId,
          }),
        );
        await queryRunner.manager.save(productTags);
      }

      await queryRunner.commitTransaction();
      return this.findBySlug(slug);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async update(id: string, dto: UpdateProductDto) {
    const product = await this.repo.findOne({
      where: { id, deleted_at: null as any },
    });
    if (!product) throw new NotFoundError("محصول یافت نشد");

    if (dto.title && dto.title !== product.title) {
      (dto as any).slug = await this.generateUniqueSlug(dto.title, id);
    }

    // Pull relations out of the scalar payload: images are replaced explicitly
    // below, and tag_ids are synced separately via syncTags().
    const { images, tag_ids, ...scalars } = dto as any;

    await AppDataSource.transaction(async (manager) => {
      Object.assign(product, scalars);
      await manager.save(product);

      if (images !== undefined) {
        // Replace the product's images with the submitted set
        await manager.delete(ProductImage, { product_id: id });
        if (images.length) {
          const newImages = images.map((img: any, index: number) =>
            manager.create(ProductImage, {
              product_id: id,
              image_url: img.image_url,
              alt_text: img.alt_text || null,
              is_thumbnail: img.is_thumbnail ?? index === 0,
              sort_order: img.sort_order ?? index,
            }),
          );
          await manager.save(newImages);
        }
      }
    });

    return this.findById(id);
  }

  async softDelete(id: string) {
    const product = await this.repo.findOne({ where: { id } });
    if (!product) throw new NotFoundError("محصول یافت نشد");
    product.deleted_at = new Date();
    return this.repo.save(product);
  }

  async bulkStatus(ids: string[], is_active: boolean) {
    // Run in a transaction so the batch is all-or-nothing: if any id does not
    // match an existing product, roll back rather than leaving a partial update.
    await AppDataSource.transaction(async (manager) => {
      const result = await manager.update(Product, { id: In(ids) }, { is_active });
      if (result.affected !== ids.length) {
        throw new NotFoundError("برخی از محصولات یافت نشدند");
      }
    });
  }

  async addImage(
    productId: string,
    dto: {
      image_url: string;
      alt_text?: string;
      is_thumbnail?: boolean;
      sort_order?: number;
    },
  ) {
    const product = await this.repo.findOne({ where: { id: productId } });
    if (!product) throw new NotFoundError("محصول یافت نشد");

    if (dto.is_thumbnail) {
      await this.imageRepo.update(
        { product_id: productId },
        { is_thumbnail: false },
      );
    }

    const image = this.imageRepo.create({ product_id: productId, ...dto });
    return this.imageRepo.save(image);
  }

  async deleteImage(imageId: string) {
    const image = await this.imageRepo.findOne({ where: { id: imageId } });
    if (!image) throw new NotFoundError("تصویر یافت نشد");
    return this.imageRepo.remove(image);
  }

  async syncTags(productId: string, tag_ids: string[]) {
    await this.productTagRepo.delete({ product_id: productId });
    if (tag_ids.length > 0) {
      const validTags = await this.tagRepo.find({ where: { id: In(tag_ids) } });
      if (validTags.length !== tag_ids.length) {
        throw new NotFoundError('برخی تگ‌ها یافت نشدند');
      }
      const productTags = tag_ids.map((tagId) =>
        this.productTagRepo.create({ product_id: productId, tag_id: tagId }),
      );
      await this.productTagRepo.save(productTags);
    }
  }

  // Private helpers
  private async generateUniqueSlug(
    title: string,
    excludeId?: string,
  ): Promise<string> {
    let slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();

    let counter = 1;
    let uniqueSlug = slug;
    while (true) {
      const qb = this.repo
        .createQueryBuilder("product")
        .where("product.slug = :slug", { slug: uniqueSlug });
      if (excludeId) qb.andWhere("product.id != :id", { id: excludeId });
      const exists = await qb.getOne();
      if (!exists) break;
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }
    return uniqueSlug;
  }

  private async getCategoryChildrenIds(categoryId: string): Promise<string[]> {
    const rows: { id: string }[] = await this.categoryRepo.query(
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

  private formatProductDetail(product: Product): any {
    const variants =
      product.variants?.map((v) => ({
        id: v.id,
        sku: v.sku,
        price: v.price,
        compare_at_price: v.compare_at_price,
        stock_quantity: v.stock_quantity,
        is_active: v.is_active,
        attributes:
          v.variant_attribute_values?.map((vav) => ({
            id: vav.attribute_value?.id || "",
            name: vav.attribute_value?.attribute?.name || "",
            value: vav.attribute_value?.value || "",
            color_code: vav.attribute_value?.color_code || null,
          })) || [],
        images:
          v.images?.map((img) => ({ id: img.id, image_url: img.image_url })) ||
          [],
      })) || [];

    return {
      id: product.id,
      title: product.title,
      slug: product.slug,
      short_description: product.short_description,
      full_description: product.full_description,
      specification: product.specification,
      category: product.category
        ? {
            id: product.category.id,
            name: product.category.name,
            slug: product.category.slug,
          }
        : null,
      brand: product.brand
        ? {
            id: product.brand.id,
            name: product.brand.name,
            slug: product.brand.slug,
            logo: product.brand.logo,
          }
        : null,
      images:
        product.images?.map((img) => ({
          id: img.id,
          image_url: img.image_url,
          alt_text: img.alt_text,
          is_thumbnail: img.is_thumbnail,
          sort_order: img.sort_order,
        })) || [],
      variants,
      tags:
        product.product_tags?.map((pt) => ({
          id: pt.tag.id,
          name: pt.tag.name,
          slug: pt.tag.slug,
        })) || [],
      seo: { title: product.seo_title, description: product.seo_description },
      avg_rating: 0,
      reviews_count: 0,
      created_at: product.created_at,
      updated_at: product.updated_at,
    };
  }
}
