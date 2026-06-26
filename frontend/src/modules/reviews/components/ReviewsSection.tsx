// src/modules/reviews/components/ReviewsSection.tsx
"use client";

import { useState } from "react";
import { useProductReviews, useCanReview } from "../hooks/useReviews";
import { useAuthStore } from "@/modules/auth/store/auth.store";
import ReviewCard from "./ReviewCard";
import ReviewForm from "./ReviewForm";
import { Card, EmptyState, Pagination, Select, Skeleton, StarRating } from "@/components/ui";
import {
  MdiCommentTextOutline,
  MdiStar,
} from "@/components/icons/Icons";

interface ReviewsSectionProps {
  productId: string;
}

export default function ReviewsSection({ productId }: ReviewsSectionProps) {
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("newest");
  const [isEditing, setIsEditing] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuthStore();

  const { data, isLoading } = useProductReviews(productId, {
    page,
    limit: 5,
    sort_by: sortBy,
  });

  const { data: canReviewData } = useCanReview(productId, isAuthenticated);

  const canSubmitNew = canReviewData?.can_review === true;
  const alreadyReviewed = canReviewData?.reason === 'already_reviewed';
  const notPurchased = canReviewData?.reason === 'not_purchased';
  const existingReview = canReviewData?.review;

  return (
    <section className="mt-12">
      <h2 className="text-xl font-bold text-text-primary mb-6">
        نظرات کاربران
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar - Rating Summary */}
        <div className="lg:col-span-1">
          <div className="bg-surface rounded-card shadow-card p-6 sticky top-24">
            <div className="text-center mb-6">
              <p className="text-4xl font-bold text-text-primary">
                {data?.meta?.avg_rating || 0}
              </p>
              <StarRating
                rating={Math.round(data?.meta?.avg_rating || 0)}
                size={20}
              />
              <p className="text-text-muted text-sm mt-1">
                {data?.meta?.total || 0} نظر
              </p>
            </div>

            {/* Distribution */}
            {data?.meta?.rating_distribution && (
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((star) => (
                  <div key={star} className="flex items-center gap-2 text-sm">
                    <span className="w-3 text-text-muted">{star}</span>
                    <MdiStar className="w-4 h-4 text-warning" />
                    <div className="flex-1 h-2 bg-surface-raised rounded-full overflow-hidden">
                      <div
                        className="h-full bg-warning rounded-full transition-all"
                        style={{
                          width: `${data.meta.total > 0 ? ((data.meta.rating_distribution[star] || 0) / data.meta.total) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <span className="w-8 text-text-muted text-xs">
                      {data.meta.rating_distribution[star] || 0}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Reviews List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Sort + Write Review */}
          <div className="flex items-center justify-between">
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              wrapperClassName="w-44"
              options={[
                { value: 'newest', label: 'جدیدترین' },
                { value: 'helpful', label: 'مفیدترین' },
                { value: 'rating_high', label: 'بیشترین امتیاز' },
                { value: 'rating_low', label: 'کمترین امتیاز' },
              ]}
            />
          </div>

          {/* Review Form / Status */}
          {isAuthenticated && (
            <>
              {canSubmitNew && !alreadyReviewed && (
                <ReviewForm productId={productId} />
              )}

              {notPurchased && (
                <div className="bg-surface rounded-card shadow-card p-4 text-sm text-text-secondary text-center">
                  برای ثبت نظر باید این محصول را خریداری کرده باشید
                </div>
              )}

              {/* Pending review: not shown in the public list (which is approved-only),
                  so surface it here with an inline editor. */}
              {alreadyReviewed && existingReview && !existingReview.is_approved && (
                <div className="space-y-3">
                  <div className="bg-primary-light/30 rounded-card p-3 text-sm text-primary flex items-center justify-between">
                    <span>نظر شما در انتظار تایید است</span>
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="text-xs underline"
                    >
                      {isEditing ? 'انصراف' : 'ویرایش نظر'}
                    </button>
                  </div>

                  {isEditing ? (
                    <ReviewForm
                      productId={productId}
                      reviewId={existingReview.id}
                      initialRating={existingReview.rating}
                      initialTitle={existingReview.title ?? ''}
                      initialComment={existingReview.comment ?? ''}
                      onSuccess={() => setIsEditing(false)}
                      onCancel={() => setIsEditing(false)}
                    />
                  ) : (
                    <ReviewCard
                      review={existingReview}
                      isOwn
                      onEdit={() => setIsEditing(true)}
                    />
                  )}
                </div>
              )}
            </>
          )}

          {/* Reviews */}
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="p-6">
                  <div className="flex gap-3 mb-3">
                    <Skeleton circle width={40} height={40} />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-12 w-full" />
                </Card>
              ))}
            </div>
          ) : data?.reviews?.length === 0 ? (
            <EmptyState
              icon={MdiCommentTextOutline}
              title="هنوز نظری ثبت نشده است"
              message="اولین نفری باشید که نظر می‌دهید!"
            />
          ) : (
            <div className="space-y-4">
              {data?.reviews?.map((review) => {
                const isOwn = !!user && review.user?.id === user.id;
                if (isOwn && editingReviewId === review.id) {
                  return (
                    <ReviewForm
                      key={review.id}
                      productId={productId}
                      reviewId={review.id}
                      initialRating={review.rating}
                      initialTitle={review.title ?? ''}
                      initialComment={review.comment ?? ''}
                      onSuccess={() => setEditingReviewId(null)}
                      onCancel={() => setEditingReviewId(null)}
                    />
                  );
                }
                return (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    isOwn={isOwn}
                    onEdit={isOwn ? () => setEditingReviewId(review.id) : undefined}
                  />
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {data?.meta && (
            <Pagination meta={data.meta} onPageChange={setPage} itemLabel="نظر" />
          )}
        </div>
      </div>
    </section>
  );
}
