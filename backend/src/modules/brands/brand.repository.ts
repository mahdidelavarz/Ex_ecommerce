// src/modules/brands/brand.repository.ts
import { AppDataSource } from '../../config/database';
import { Brand } from '../../database/entities/brand.entity';
import { Product } from '../../database/entities/product.entity';
import { NotFoundError, ConflictError } from '../../shared/utils/errors';
import { CreateBrandDto, UpdateBrandDto } from './brand.types';

export class BrandRepository {
  private repo = AppDataSource.getRepository(Brand);
  private productRepo = AppDataSource.getRepository(Product);

  async findAll(options: {
    search?: string;
    is_active?: boolean;
    page: number;
    limit: number;
    sort_by: string;
    sort_order: 'ASC' | 'DESC';
  }) {
    const qb = this.repo
      .createQueryBuilder('brand')
      .leftJoin('brand.products', 'products')
      .select(['brand', 'COUNT(products.id) as products_count'])
      .groupBy('brand.id');

    if (options.is_active !== undefined) {
      qb.andWhere('brand.is_active = :is_active', {
        is_active: options.is_active,
      });
    }

    if (options.search) {
      qb.andWhere(
        '(brand.name ILIKE :search OR brand.description ILIKE :search)',
        { search: `%${options.search}%` }
      );
    }

    qb.orderBy(`brand.${options.sort_by}`, options.sort_order);
    qb.skip((options.page - 1) * options.limit);
    qb.take(options.limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data: data.map((brand: any) => ({
        ...brand,
        products_count: parseInt(brand.products_count) || 0,
      })),
      total,
    };
  }

  async findAllMinimal() {
    return this.repo.find({
      where: { is_active: true },
      select: ['id', 'name', 'slug', 'logo'],
      order: { name: 'ASC' },
    });
  }

  async findByIdOrSlug(idOrSlug: string) {
    const isUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        idOrSlug
      );

    const brand = await this.repo.findOne({
      where: isUUID ? { id: idOrSlug } : { slug: idOrSlug },
    });

    if (!brand) {
      throw new NotFoundError('برند مورد نظر یافت نشد');
    }

    const productsCount = await this.productRepo.count({
      where: { brand_id: brand.id },
    });

    return { ...brand, products_count: productsCount };
  }

  async create(dto: CreateBrandDto) {
    const slug = await this.generateUniqueSlug(dto.name);

    const brand = this.repo.create({
      name: dto.name,
      slug,
      logo: dto.logo || null,
      description: dto.description || null,
    });

    return this.repo.save(brand);
  }

  async update(id: string, dto: UpdateBrandDto) {
    const brand = await this.repo.findOne({ where: { id } });
    if (!brand) {
      throw new NotFoundError('برند مورد نظر یافت نشد');
    }

    if (dto.name && dto.name !== brand.name) {
      brand.slug = await this.generateUniqueSlug(dto.name, id);
      brand.name = dto.name;
    }

    if (dto.logo !== undefined) brand.logo = dto.logo;
    if (dto.description !== undefined) brand.description = dto.description;

    return this.repo.save(brand);
  }

  async delete(id: string) {
    const brand = await this.repo.findOne({
      where: { id },
      relations: ['products'],
    });

    if (!brand) {
      throw new NotFoundError('برند مورد نظر یافت نشد');
    }

    if (brand.products && brand.products.length > 0) {
      throw new ConflictError(
        'این برند دارای محصول است و نمی‌توان آن را حذف کرد'
      );
    }

    await this.repo.remove(brand);
  }

  private async generateUniqueSlug(name: string, excludeId?: string): Promise<string> {
    let slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    let counter = 1;
    let uniqueSlug = slug;
    while (true) {
      const qb = this.repo
        .createQueryBuilder('brand')
        .where('brand.slug = :slug', { slug: uniqueSlug });

      if (excludeId) {
        qb.andWhere('brand.id != :id', { id: excludeId });
      }

      const exists = await qb.getOne();
      if (!exists) break;

      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }

    return uniqueSlug;
  }
}