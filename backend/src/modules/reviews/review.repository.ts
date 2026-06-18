// src/modules/reviews/review.repository.ts
import { AppDataSource } from '../../config/database';
import { Review } from '../../database/entities/review.entity';
import { ReviewHelpfulVote } from '../../database/entities/review-helpful-vote.entity';
import { OrderItem } from '../../database/entities/order-item.entity';
import { Order } from '../../database/entities/order.entity';
import { NotFoundError, BadRequestError } from '../../shared/utils/errors';
import { CreateReviewDto, UpdateReviewDto } from './review.types';

export class ReviewRepository {
  private repo = AppDataSource.getRepository(Review);
  private helpfulVoteRepo = AppDataSource.getRepository(ReviewHelpfulVote);
  private orderItemRepo = AppDataSource.getRepository(OrderItem);
  private orderRepo = AppDataSource.getRepository(Order);

  async findByProduct(productId: string, options: { page: number; limit: number; sort_by?: string; userId?: string }) {
    const qb = this.repo
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.user', 'user')
      .where('review.product_id = :productId', { productId })
      .andWhere('review.is_approved = true');

    switch (options.sort_by) {
      case 'helpful': qb.orderBy('review.helpful_count', 'DESC'); break;
      case 'rating_high': qb.orderBy('review.rating', 'DESC'); break;
      case 'rating_low': qb.orderBy('review.rating', 'ASC'); break;
      default: qb.orderBy('review.created_at', 'DESC');
    }

    qb.skip((options.page - 1) * options.limit).take(options.limit);
    const [data, total] = await qb.getManyAndCount();

    // Determine which reviews the current user has voted on
    let votedReviewIds = new Set<string>();
    if (options.userId && data.length > 0) {
      const reviewIds = data.map((r) => r.id);
      const votes = await this.helpfulVoteRepo
        .createQueryBuilder('vote')
        .where('vote.user_id = :userId', { userId: options.userId })
        .andWhere('vote.review_id IN (:...reviewIds)', { reviewIds })
        .getMany();
      votedReviewIds = new Set(votes.map((v) => v.review_id));
    }

    // Get stats
    const stats = await this.repo
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'avg')
      .addSelect('review.rating', 'rating')
      .addSelect('COUNT(*)', 'count')
      .where('review.product_id = :productId', { productId })
      .andWhere('review.is_approved = true')
      .groupBy('review.rating')
      .getRawMany();

    const avgRating = stats.length > 0
      ? stats.reduce((sum, s) => sum + parseFloat(s.rating) * parseInt(s.count), 0) / stats.reduce((sum, s) => sum + parseInt(s.count), 0)
      : 0;

    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    stats.forEach((s) => { distribution[parseInt(s.rating)] = parseInt(s.count); });

    return {
      reviews: data.map((r) => ({
        id: r.id,
        user: { id: r.user?.id, full_name: r.user?.full_name || 'ناشناس' },
        rating: r.rating,
        title: r.title,
        comment: r.comment,
        verified_purchase: r.verified_purchase,
        helpful_count: r.helpful_count,
        user_has_voted: votedReviewIds.has(r.id),
        admin_reply: r.admin_reply,
        replied_at: r.replied_at,
        created_at: r.created_at,
        updated_at: r.updated_at,
      })),
      total,
      avg_rating: Math.round(avgRating * 10) / 10,
      rating_distribution: distribution,
    };
  }

  async findById(id: string) {
    const review = await this.repo.findOne({ where: { id }, relations: ['user'] });
    if (!review) throw new NotFoundError('نظر یافت نشد');
    return review;
  }

  async canReview(productId: string, userId: string) {
    const existing = await this.repo.findOne({ where: { user_id: userId, product_id: productId } });
    if (existing) {
      return { can_review: false, reason: 'already_reviewed' as const, review: existing };
    }

    const purchased = await this.orderItemRepo
      .createQueryBuilder('item')
      .leftJoin('item.order', 'order')
      .where('order.user_id = :userId', { userId })
      .andWhere('item.product_snapshot @> :snapshot', { snapshot: { product_id: productId } })
      .getCount();

    return {
      can_review: purchased > 0,
      reason: purchased > 0 ? null : ('not_purchased' as const),
      review: null,
    };
  }

  async create(userId: string, dto: CreateReviewDto) {
    const existing = await this.repo.findOne({
      where: { user_id: userId, product_id: dto.product_id },
    });
    if (existing) throw new BadRequestError('شما قبلاً برای این محصول نظر ثبت کرده‌اید');

    const purchased = await this.orderItemRepo
      .createQueryBuilder('item')
      .leftJoin('item.order', 'order')
      .where('order.user_id = :userId', { userId })
      .andWhere('item.product_snapshot @> :snapshot', {
        snapshot: { product_id: dto.product_id },
      })
      .getCount();

    const review = this.repo.create({
      user_id: userId,
      product_id: dto.product_id,
      rating: dto.rating,
      title: dto.title || null,
      comment: dto.comment || null,
      verified_purchase: purchased > 0,
      is_approved: false,
    });

    return this.repo.save(review);
  }

  async update(reviewId: string, userId: string, dto: UpdateReviewDto) {
    const review = await this.repo.findOne({ where: { id: reviewId, user_id: userId } });
    if (!review) throw new NotFoundError('نظر یافت نشد');

    if (dto.rating !== undefined) review.rating = dto.rating;
    if (dto.title !== undefined) review.title = dto.title;
    if (dto.comment !== undefined) review.comment = dto.comment;

    return this.repo.save(review);
  }

  async delete(reviewId: string, userId: string) {
    const review = await this.repo.findOne({ where: { id: reviewId, user_id: userId } });
    if (!review) throw new NotFoundError('نظر یافت نشد');
    await this.repo.remove(review);
  }

  async adminDelete(reviewId: string) {
    const review = await this.repo.findOne({ where: { id: reviewId } });
    if (!review) throw new NotFoundError('نظر یافت نشد');
    await this.repo.remove(review);
  }

  async markHelpful(reviewId: string, userId: string): Promise<{ helpful_count: number; voted: boolean }> {
    const review = await this.repo.findOne({ where: { id: reviewId } });
    if (!review) throw new NotFoundError('نظر یافت نشد');

    const existing = await this.helpfulVoteRepo.findOne({
      where: { review_id: reviewId, user_id: userId },
    });

    if (existing) {
      await this.helpfulVoteRepo.delete({ review_id: reviewId, user_id: userId });
      await this.repo.decrement({ id: reviewId }, 'helpful_count', 1);
      return { helpful_count: Math.max(0, review.helpful_count - 1), voted: false };
    }

    await this.helpfulVoteRepo.save({ review_id: reviewId, user_id: userId });
    await this.repo.increment({ id: reviewId }, 'helpful_count', 1);
    return { helpful_count: review.helpful_count + 1, voted: true };
  }

  async findAllAdmin(options: { page: number; limit: number; is_approved?: boolean; product_id?: string }) {
    const qb = this.repo
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.user', 'user')
      .leftJoinAndSelect('review.product', 'product')
      .orderBy('review.created_at', 'DESC');

    if (options.is_approved !== undefined) {
      qb.andWhere('review.is_approved = :is_approved', { is_approved: options.is_approved });
    }
    if (options.product_id) {
      qb.andWhere('review.product_id = :product_id', { product_id: options.product_id });
    }

    qb.skip((options.page - 1) * options.limit).take(options.limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }

  async approve(reviewId: string, is_approved: boolean) {
    const review = await this.repo.findOne({ where: { id: reviewId } });
    if (!review) throw new NotFoundError('نظر یافت نشد');
    review.is_approved = is_approved;
    return this.repo.save(review);
  }

  async reply(reviewId: string, admin_reply: string) {
    const review = await this.repo.findOne({ where: { id: reviewId } });
    if (!review) throw new NotFoundError('نظر یافت نشد');
    review.admin_reply = admin_reply;
    review.replied_at = new Date();
    return this.repo.save(review);
  }
}
