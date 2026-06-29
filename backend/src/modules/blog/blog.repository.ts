// src/modules/blog/blog.repository.ts
import { AppDataSource } from '../../config/database';
import { BlogPost } from '../../database/entities/blog-post.entity';
import { NotFoundError } from '../../shared/utils/errors';
import {
  BlogQueryParams,
  CreateBlogDto,
  UpdateBlogDto,
  BlogPostListItem,
  BlogPostDetail,
} from './blog.types';

export class BlogRepository {
  private repo = AppDataSource.getRepository(BlogPost);

  async findAll(options: BlogQueryParams) {
    const page = options.page || 1;
    const limit = Math.min(options.limit || 12, 50);
    const sort_by = options.sort_by || 'published_at';
    const sort_order = options.sort_order || 'DESC';

    const qb = this.repo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .where('post.deleted_at IS NULL');

    if (options.is_published !== undefined) {
      qb.andWhere('post.is_published = :is_published', {
        is_published: options.is_published,
      });
    }

    if (options.tag) {
      qb.andWhere(':tag = ANY(post.tags)', { tag: options.tag });
    }

    if (options.search) {
      qb.andWhere(
        '(post.title ILIKE :search OR post.excerpt ILIKE :search)',
        { search: `%${options.search}%` },
      );
    }

    // published_at can be null for drafts; fall back to created_at ordering
    if (sort_by === 'published_at') {
      qb.orderBy('post.published_at', sort_order, 'NULLS LAST').addOrderBy(
        'post.created_at',
        sort_order,
      );
    } else {
      qb.orderBy(`post.${sort_by}`, sort_order);
    }

    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data: data.map((p) => this.formatListItem(p)),
      total,
    };
  }

  async findBySlugPublic(slug: string): Promise<BlogPostDetail> {
    const post = await this.repo.findOne({
      where: { slug, deleted_at: null as any, is_published: true },
      relations: ['author'],
    });
    if (!post) throw new NotFoundError('مطلب مورد نظر یافت نشد');

    // Fire-and-forget view increment so it never blocks the response.
    this.repo
      .increment({ id: post.id }, 'view_count', 1)
      .catch(() => undefined);
    post.view_count += 1;

    const related = await this.findRelated(post.tags, post.id, 4);

    return this.formatDetail(post, related);
  }

  /** Admin: fetch by id regardless of publish state (for the edit form). */
  async findByIdAdmin(id: string): Promise<BlogPostDetail> {
    const post = await this.repo.findOne({
      where: { id, deleted_at: null as any },
      relations: ['author'],
    });
    if (!post) throw new NotFoundError('مطلب مورد نظر یافت نشد');
    return this.formatDetail(post, []);
  }

  async findRelated(
    tags: string[],
    excludeId: string,
    limit = 4,
  ): Promise<BlogPostListItem[]> {
    const qb = this.repo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .where('post.deleted_at IS NULL')
      .andWhere('post.is_published = true')
      .andWhere('post.id != :excludeId', { excludeId });

    if (tags && tags.length > 0) {
      // Array overlap: posts sharing at least one tag.
      qb.andWhere('post.tags && :tags', { tags });
    }
    qb.orderBy('post.published_at', 'DESC', 'NULLS LAST')
      .addOrderBy('post.created_at', 'DESC')
      .take(limit);

    const data = await qb.getMany();
    return data.map((p) => this.formatListItem(p));
  }

  async create(dto: CreateBlogDto, authorId: string | null) {
    const slug = await this.generateUniqueSlug(dto.title);

    const publish = dto.is_published ?? false;
    const post = this.repo.create({
      title: dto.title.trim(),
      slug,
      excerpt: dto.excerpt ?? null,
      content: dto.content,
      cover_image: dto.cover_image ?? null,
      tags: dto.tags ?? [],
      is_published: publish,
      published_at: this.resolvePublishedAt(publish, dto.published_at, null),
      seo_title: dto.seo_title ?? null,
      seo_description: dto.seo_description ?? null,
      seo_keywords: dto.seo_keywords ?? null,
      author_id: authorId,
    });

    const saved = await this.repo.save(post);
    return this.findByIdAdmin(saved.id);
  }

  async update(id: string, dto: UpdateBlogDto) {
    const post = await this.repo.findOne({
      where: { id, deleted_at: null as any },
    });
    if (!post) throw new NotFoundError('مطلب مورد نظر یافت نشد');

    if (dto.title && dto.title.trim() !== post.title) {
      post.slug = await this.generateUniqueSlug(dto.title, id);
      post.title = dto.title.trim();
    }

    if (dto.content !== undefined) post.content = dto.content;
    if (dto.excerpt !== undefined) post.excerpt = dto.excerpt;
    if (dto.cover_image !== undefined) post.cover_image = dto.cover_image;
    if (dto.tags !== undefined) post.tags = dto.tags;
    if (dto.seo_title !== undefined) post.seo_title = dto.seo_title;
    if (dto.seo_description !== undefined) post.seo_description = dto.seo_description;
    if (dto.seo_keywords !== undefined) post.seo_keywords = dto.seo_keywords;

    if (dto.is_published !== undefined) {
      post.published_at = this.resolvePublishedAt(
        dto.is_published,
        dto.published_at,
        post.published_at,
      );
      post.is_published = dto.is_published;
    } else if (dto.published_at !== undefined) {
      post.published_at = dto.published_at ? new Date(dto.published_at) : null;
    }

    await this.repo.save(post);
    return this.findByIdAdmin(id);
  }

  async softDelete(id: string) {
    const post = await this.repo.findOne({ where: { id } });
    if (!post) throw new NotFoundError('مطلب مورد نظر یافت نشد');
    post.deleted_at = new Date();
    return this.repo.save(post);
  }

  // Helpers --------------------------------------------------------------

  /**
   * When a post is published and has no publish date yet, stamp it now.
   * An explicit published_at always wins. Unpublishing keeps the existing date.
   */
  private resolvePublishedAt(
    isPublished: boolean,
    explicit: string | null | undefined,
    current: Date | null,
  ): Date | null {
    if (explicit) return new Date(explicit);
    if (isPublished && !current) return new Date();
    return current;
  }

  private formatListItem(p: BlogPost): BlogPostListItem {
    return {
      id: p.id,
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt,
      cover_image: p.cover_image,
      tags: p.tags ?? [],
      author: p.author
        ? { id: p.author.id, full_name: p.author.full_name }
        : null,
      is_published: p.is_published,
      published_at: p.published_at,
      view_count: p.view_count,
      created_at: p.created_at,
      updated_at: p.updated_at,
    };
  }

  private formatDetail(
    p: BlogPost,
    related: BlogPostListItem[],
  ): BlogPostDetail {
    return {
      ...this.formatListItem(p),
      content: p.content,
      seo: {
        title: p.seo_title,
        description: p.seo_description,
        keywords: p.seo_keywords,
      },
      related,
    };
  }

  private async generateUniqueSlug(
    title: string,
    excludeId?: string,
  ): Promise<string> {
    let slug = title
      .toLowerCase()
      .replace(/[^a-z0-9؀-ۿ\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    if (!slug) slug = 'post';

    let counter = 1;
    let uniqueSlug = slug;
    while (true) {
      const qb = this.repo
        .createQueryBuilder('post')
        .where('post.slug = :slug', { slug: uniqueSlug });
      if (excludeId) qb.andWhere('post.id != :id', { id: excludeId });
      const exists = await qb.getOne();
      if (!exists) break;
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }
    return uniqueSlug;
  }
}
