// src/modules/reviews/review.service.ts
import { ReviewRepository } from './review.repository';
import { CreateReviewDto, UpdateReviewDto } from './review.types';

export class ReviewService {
  private repo = new ReviewRepository();

  async findByProduct(productId: string, options: { page?: number; limit?: number; sort_by?: string; userId?: string }) {
    const page = options.page || 1;
    const limit = options.limit || 10;
    return this.repo.findByProduct(productId, { page, limit, sort_by: options.sort_by, userId: options.userId });
  }

  async canReview(productId: string, userId: string) {
    return this.repo.canReview(productId, userId);
  }

  async create(userId: string, dto: CreateReviewDto) {
    return this.repo.create(userId, dto);
  }

  async update(reviewId: string, userId: string, dto: UpdateReviewDto) {
    return this.repo.update(reviewId, userId, dto);
  }

  async delete(reviewId: string, userId: string) {
    return this.repo.delete(reviewId, userId);
  }

  async adminDelete(reviewId: string) {
    return this.repo.adminDelete(reviewId);
  }

  async markHelpful(reviewId: string, userId: string) {
    return this.repo.markHelpful(reviewId, userId);
  }

  async findAllAdmin(options: any) {
    const page = parseInt(options.page) || 1;
    const limit = parseInt(options.limit) || 20;
    let is_approved: boolean | undefined;
    if (options.is_approved === 'true') is_approved = true;
    else if (options.is_approved === 'false') is_approved = false;
    const { data, total } = await this.repo.findAllAdmin({ ...options, page, limit, is_approved });
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async approve(reviewId: string, is_approved: boolean) {
    return this.repo.approve(reviewId, is_approved);
  }

  async reply(reviewId: string, admin_reply: string) {
    return this.repo.reply(reviewId, admin_reply);
  }
}
