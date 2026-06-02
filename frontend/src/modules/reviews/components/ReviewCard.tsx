// src/modules/reviews/components/ReviewCard.tsx
import { Icon } from '@iconify/react';
import StarRating from '@/components/ui/StarRating';
import { useMarkHelpful } from '../hooks/useReviews';
import type { Review } from '../types/review.types';

interface ReviewCardProps {
  review: Review;
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const markHelpful = useMarkHelpful();

  return (
    <div className="bg-surface rounded-card shadow-card p-6">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary-light rounded-full flex items-center justify-center">
              <Icon icon="mdi:account" className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-text-primary">{review.user.full_name}</p>
              <p className="text-xs text-text-muted">
                {new Date(review.created_at).toLocaleDateString('fa-IR')}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {review.verified_purchase && (
            <span className="bg-success-light text-success text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
              <Icon icon="mdi:check-circle" className="w-3 h-3" />
              خریدار
            </span>
          )}
        </div>
      </div>

      <StarRating rating={review.rating} size={16} />

      {review.title && (
        <h4 className="font-medium text-text-primary mt-3">{review.title}</h4>
      )}

      {review.comment && (
        <p className="text-text-secondary text-sm mt-2 leading-relaxed">{review.comment}</p>
      )}

      {/* Admin Reply */}
      {review.admin_reply && (
        <div className="mt-4 bg-primary-light/50 rounded-card p-4 border-r-4 border-primary">
          <p className="text-xs font-medium text-primary mb-1">پاسخ فروشنده:</p>
          <p className="text-text-secondary text-sm">{review.admin_reply}</p>
        </div>
      )}

      {/* Helpful Button */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
        <button
          onClick={() => markHelpful.mutate(review.id)}
          className="flex items-center gap-1 text-sm text-text-muted hover:text-primary transition-colors"
        >
          <Icon icon="mdi:thumb-up-outline" className="w-4 h-4" />
          مفید بود؟ {review.helpful_count > 0 && <span>({review.helpful_count})</span>}
        </button>
      </div>
    </div>
  );
}