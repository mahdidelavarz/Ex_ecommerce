// src/modules/reviews/components/ReviewForm.tsx
'use client';

import { useState } from 'react';
import { useCreateReview } from '../hooks/useReviews';
import StarRating from '@/components/ui/StarRating';
import Button from '@/components/ui/Button';

interface ReviewFormProps {
  productId: string;
  onSuccess?: () => void;
}

export default function ReviewForm({ productId, onSuccess }: ReviewFormProps) {
  const createReview = useCreateReview();
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;

    createReview.mutate(
      { product_id: productId, rating, title: title || undefined, comment: comment || undefined },
      { onSuccess: () => { setRating(0); setTitle(''); setComment(''); onSuccess?.(); } }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="bg-surface rounded-card shadow-card p-6">
      <h3 className="font-bold text-text-primary mb-4">ثبت نظر</h3>

      <div className="mb-4">
        <label className="text-sm text-text-secondary block mb-2">امتیاز شما</label>
        <StarRating rating={rating} interactive onChange={setRating} size={28} />
      </div>

      <div className="mb-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="عنوان نظر (اختیاری)"
          className="w-full px-4 py-2 bg-surface border border-border rounded-input text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="mb-4">
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="نظر خود را بنویسید..."
          rows={4}
          className="w-full px-4 py-2 bg-surface border border-border rounded-input text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        />
      </div>

      <Button type="submit" loading={createReview.isPending} disabled={rating === 0}>
        ثبت نظر
      </Button>
    </form>
  );
}