// src/modules/reviews/components/ReviewCard.tsx
'use client';

import { useState } from 'react';
import StarRating from '@/components/ui/StarRating';
import { useMarkHelpful } from '../hooks/useReviews';
import type { Review } from '../types/review.types';
import { MdiAccount, MdiCheckCircle, MdiThumbUpOutline } from '@/components/icons/Icons';

interface ReviewCardProps {
  review: Review;
  isOwn?: boolean;
  onEdit?: () => void;
}

export default function ReviewCard({ review, isOwn, onEdit }: ReviewCardProps) {
  const markHelpful = useMarkHelpful();
  const [hasVoted, setHasVoted] = useState(review.user_has_voted ?? false);
  const [helpfulCount, setHelpfulCount] = useState(review.helpful_count);

  const handleHelpful = () => {
    markHelpful.mutate(review.id, {
      onSuccess: (data) => {
        setHasVoted(data.voted);
        setHelpfulCount(data.helpful_count);
      },
    });
  };

  return (
    <div className="bg-surface rounded-card shadow-card p-6">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary-light rounded-full flex items-center justify-center">
              <MdiAccount className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-text-primary">{review.user?.full_name ?? 'شما'}</p>
              <p className="text-xs text-text-muted">
                {new Date(review.created_at).toLocaleDateString('fa-IR')}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {review.verified_purchase && (
            <span className="bg-success-light text-success text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
              <MdiCheckCircle className="w-3 h-3" />
              خریدار
            </span>
          )}
          {isOwn && onEdit && (
            <button
              onClick={onEdit}
              className="text-xs text-primary hover:underline"
            >
              ویرایش
            </button>
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
          onClick={handleHelpful}
          disabled={markHelpful.isPending}
          className={`flex items-center gap-1 text-sm transition-colors ${
            hasVoted ? 'text-primary font-medium' : 'text-text-muted hover:text-primary'
          }`}
        >
          <MdiThumbUpOutline className="w-4 h-4" />
          {hasVoted ? 'مفید بود ✓' : 'مفید بود؟'}{helpfulCount > 0 && <span>({helpfulCount})</span>}
        </button>
      </div>
    </div>
  );
}
