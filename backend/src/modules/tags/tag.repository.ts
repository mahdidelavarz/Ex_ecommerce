// src/modules/tags/tag.repository.ts
import { AppDataSource } from '../../config/database';
import { Tag } from '../../database/entities/tag.entity';
import { ProductTag } from '../../database/entities/product-tag.entity';
import { NotFoundError, ConflictError } from '../../shared/utils/errors';
import { CreateTagDto, UpdateTagDto } from './tag.types';

export class TagRepository {
  private repo = AppDataSource.getRepository(Tag);
  private productTagRepo = AppDataSource.getRepository(ProductTag);

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
    const slug = await this.generateUniqueSlug(dto.name);
    const existing = await this.repo.findOne({ where: { slug } });
    if (existing) throw new ConflictError('تگ با این نام قبلاً ثبت شده است');

    const tag = this.repo.create({ name: dto.name, slug });
    return this.repo.save(tag);
  }

  async update(id: string, dto: UpdateTagDto) {
    const tag = await this.repo.findOne({ where: { id } });
    if (!tag) throw new NotFoundError('تگ یافت نشد');

    if (dto.name && dto.name !== tag.name) {
      tag.slug = await this.generateUniqueSlug(dto.name, id);
      tag.name = dto.name;
    }

    return this.repo.save(tag);
  }

  async delete(id: string) {
    const tag = await this.repo.findOne({ where: { id } });
    if (!tag) throw new NotFoundError('تگ یافت نشد');

    await this.productTagRepo.delete({ tag_id: id });
    await this.repo.remove(tag);
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