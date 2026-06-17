// src/modules/tags/tag.repository.ts
import { AppDataSource } from '../../config/database';
import { Tag } from '../../database/entities/tag.entity';
import { ProductTag } from '../../database/entities/product-tag.entity';
import { Product } from '../../database/entities/product.entity';
import { NotFoundError, ConflictError, BadRequestError } from '../../shared/utils/errors';
import { CreateTagDto, UpdateTagDto } from './tag.types';

export class TagRepository {
  private repo = AppDataSource.getRepository(Tag);
  private productTagRepo = AppDataSource.getRepository(ProductTag);
  private productRepo = AppDataSource.getRepository(Product);

  async findAll(options: { search?: string; page: number; limit: number }) {
    const qb = this.repo
      .createQueryBuilder('tag')
      .leftJoin('tag.product_tags', 'product_tags')
      .addSelect('COUNT(product_tags.tag_id)', 'products_count')
      .groupBy('tag.id')
      .orderBy('tag.name', 'ASC');

    if (options.search) {
      qb.andWhere('tag.name ILIKE :search', { search: `%${options.search}%` });
    }

    qb.skip((options.page - 1) * options.limit);
    qb.take(options.limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data: data.map((t: any) => ({ ...t, products_count: parseInt(t.products_count) || 0 })),
      total,
    };
  }

  async findAllMinimal() {
    return this.repo.find({ order: { name: 'ASC' } });
  }

  async findById(id: string) {
    const tag = await this.repo.findOne({ where: { id } });
    if (!tag) throw new NotFoundError('تگ یافت نشد');
    return tag;
  }

  async create(dto: CreateTagDto) {
    const trimmedName = dto.name.trim();
    if (!trimmedName) throw new BadRequestError('نام تگ نمی‌تواند خالی باشد');

    const existingByName = await this.repo.findOne({ where: { name: trimmedName } });
    if (existingByName) throw new ConflictError('تگ با این نام قبلاً ثبت شده است');

    const slug = await this.generateUniqueSlug(trimmedName);
    if (!slug) throw new BadRequestError('نام تگ نامعتبر است');

    const tag = this.repo.create({ name: trimmedName, slug });
    return this.repo.save(tag);
  }

  async update(id: string, dto: UpdateTagDto) {
    const tag = await this.repo.findOne({ where: { id } });
    if (!tag) throw new NotFoundError('تگ یافت نشد');

    if (dto.name && dto.name !== tag.name) {
      const trimmedName = dto.name.trim();
      if (!trimmedName) throw new BadRequestError('نام تگ نمی‌تواند خالی باشد');

      const existingByName = await this.repo.findOne({ where: { name: trimmedName } });
      if (existingByName && existingByName.id !== id) throw new ConflictError('تگ با این نام قبلاً ثبت شده است');

      const slug = await this.generateUniqueSlug(trimmedName, id);
      if (!slug) throw new BadRequestError('نام تگ نامعتبر است');

      tag.slug = slug;
      tag.name = trimmedName;
    }

    return this.repo.save(tag);
  }

  async delete(id: string) {
    const tag = await this.repo.findOne({ where: { id } });
    if (!tag) throw new NotFoundError('تگ یافت نشد');

    await this.productTagRepo.delete({ tag_id: id });
    await this.repo.remove(tag);
  }

  async getProductsByTag(slug: string, options: { page: number; limit: number }) {
    const { page, limit } = options;

    const tag = await this.repo.findOne({ where: { slug } });
    if (!tag) throw new NotFoundError('تگ یافت نشد');

    const [data, total] = await this.productRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.category', 'category')
      .leftJoinAndSelect('p.brand', 'brand')
      .innerJoin('p.product_tags', 'pt', 'pt.tag_id = :tagId', { tagId: tag.id })
      .where('p.deleted_at IS NULL')
      .andWhere('p.is_active = true')
      .orderBy('p.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      tag: { id: tag.id, name: tag.name, slug: tag.slug },
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
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
      const qb = this.repo.createQueryBuilder('tag').where('tag.slug = :slug', { slug: uniqueSlug });
      if (excludeId) qb.andWhere('tag.id != :id', { id: excludeId });
      const exists = await qb.getOne();
      if (!exists) break;
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }
    return uniqueSlug;
  }
}