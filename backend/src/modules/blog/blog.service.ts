// src/modules/blog/blog.service.ts
import { BlogRepository } from './blog.repository';
import { BlogQueryParams, CreateBlogDto, UpdateBlogDto } from './blog.types';

/**
 * @module Blog
 * @description Business logic for blog posts.
 *
 * Public: list (published only), get published post by slug (+ related, view count)
 * Admin: list (incl. drafts), get by id, create, update, soft delete
 */
export class BlogService {
  private repo = new BlogRepository();

  async list(options: BlogQueryParams) {
    const page = options.page || 1;
    const limit = Math.min(options.limit || 12, 50);

    const { data, total } = await this.repo.findAll({ ...options, page, limit });

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

  getBySlug(slug: string) {
    return this.repo.findBySlugPublic(slug);
  }

  getByIdAdmin(id: string) {
    return this.repo.findByIdAdmin(id);
  }

  create(dto: CreateBlogDto, authorId: string | null) {
    return this.repo.create(dto, authorId);
  }

  update(id: string, dto: UpdateBlogDto) {
    return this.repo.update(id, dto);
  }

  async delete(id: string): Promise<void> {
    await this.repo.softDelete(id);
  }
}
