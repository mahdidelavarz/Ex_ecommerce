// src/modules/reviews/review.types.ts
export interface ReviewResponse {
  id: string;
  user: {
    id: string;
    full_name: string;
  };
  rating: number;
  title: string | null;
  comment: string | null;
  verified_purchase: boolean;
  helpful_count: number;
  is_approved: boolean;
  admin_reply: string | null;
  replied_at: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateReviewDto {
  product_id: string;
  rating: number;
  title?: string;
  comment?: string;
}

export interface UpdateReviewDto {
  rating?: number;
  title?: string;
  comment?: string;
}

export interface ProductReviewsResponse {
  reviews: ReviewResponse[];
  avg_rating: number;
  rating_distribution: Record<number, number>;
}