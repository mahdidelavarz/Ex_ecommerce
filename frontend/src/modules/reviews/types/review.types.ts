// src/modules/reviews/types/review.types.ts
export interface ReviewUser {
  id: string;
  full_name: string;
}

export interface Review {
  id: string;
  user: ReviewUser;
  rating: number;
  title: string | null;
  comment: string | null;
  verified_purchase: boolean;
  helpful_count: number;
  user_has_voted: boolean;
  is_approved: boolean;
  admin_reply: string | null;
  replied_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CanReviewResponse {
  can_review: boolean;
  reason: 'already_reviewed' | 'not_purchased' | null;
  review: Review | null;
}

export interface ProductReviewsData {
  reviews: Review[];
  total: number;
  avg_rating: number;
  rating_distribution: Record<number, number>;
}
