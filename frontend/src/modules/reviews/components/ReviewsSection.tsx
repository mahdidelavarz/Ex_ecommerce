// src/modules/reviews/components/ReviewsSection.tsx
'use client';

import { useState } from 'react';
import { Icon } from '@iconify/react';
import { useProductReviews } from '../hooks/useReviews';
import { useAuthStore } from '@/modules/auth/store/auth.store';
import ReviewCard from './ReviewCard';
import ReviewForm from './ReviewForm';
import StarRating from '@/components/ui/StarRating';

interface ReviewsSectionProps {
  productId: string;
}

export default function ReviewsSection({ productId }: ReviewsSectionProps) {
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('newest');
  const { isAuthenticated } = useAuthStore();

  const { data, isLoading } = useProductReviews(productId, { page, limit: 5, sort_by: sortBy });

  return (
    <section className="mt-12">
      <h2 className="text-xl font-bold text-text-primary mb-6">نظرات کاربران</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar - Rating Summary */}
        <div className="lg:col-span-1">
          <div className="bg-surface rounded-card shadow-card p-6 sticky top-24">
            <div className="text-center mb-6">
              <p className="text-4xl font-bold text-text-primary">
                {data?.meta?.avg_rating || 0}
              </p>
              <StarRating rating={Math.round(data?.meta?.avg_rating || 0)} size={20} />
              <p className="text-text-muted text-sm mt-1">{data?.meta?.total || 0} نظر</p>
            </div>

            {/* Distribution */}
            {data?.meta?.rating_distribution && (
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((star) => (
                  <div key={star} className="flex items-center gap-2 text-sm">
                    <span className="w-3 text-text-muted">{star}</span>
                    <Icon icon="mdi:star" className="w-4 h-4 text-warning" />
                    <div className="flex-1 h-2 bg-surface-raised rounded-full overflow-hidden">
                      <div
                        className="h-full bg-warning rounded-full transition-all"
                        style={{
                          width: `${data.meta.total > 0 ? ((data.meta.rating_distribution[star] || 0) / data.meta.total) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <span className="w-8 text-text-muted text-xs">{data.meta.rating_distribution[star] || 0}</span>
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
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-surface border border-border rounded-input text-sm"
            >
              <option value="newest">جدیدترین</option>
              <option value="helpful">مفیدترین</option>
              <option value="rating_high">بیشترین امتیاز</option>
              <option value="rating_low">کمترین امتیاز</option>
            </select>
          </div>

          {/* Review Form */}
          {isAuthenticated && (
            <ReviewForm productId={productId} />
          )}

          {/* Reviews */}
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-surface rounded-card shadow-card p-6 animate-pulse-soft">
                  <div className="flex gap-3 mb-3">
                    <div className="w-10 h-10 bg-surface-raised rounded-full" />
                    <div className="space-y-2">
                      <div className="h-4 bg-surface-raised rounded w-24" />
                      <div className="h-3 bg-surface-raised rounded w-16" />
                    </div>
                  </div>
                  <div className="h-12 bg-surface-raised rounded" />
                </div>
              ))}
            </div>
          ) : data?.reviews?.length === 0 ? (
            <div className="text-center py-12">
              <Icon icon="mdi:comment-text-outline" className="text-text-muted mx-auto mb-3" width={48} />
              <p className="text-text-secondary">هنوز نظری ثبت نشده است</p>
              <p className="text-text-muted text-sm mt-1">اولین نفری باشید که نظر می‌دهید!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {data?.reviews?.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {data?.meta && data.meta.totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-2 hover:bg-surface rounded-button disabled:opacity-50">
                <Icon icon="mdi:chevron-right" className="w-5 h-5" />
              </button>
              <span className="px-4 py-2 text-sm text-text-secondary">{page} از {data.meta.totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(data.meta.totalPages, p + 1))} disabled={page === data.meta.totalPages} className="p-2 hover:bg-surface rounded-button disabled:opacity-50">
                <Icon icon="mdi:chevron-left" className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}