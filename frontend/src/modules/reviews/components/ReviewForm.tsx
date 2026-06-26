// src/modules/reviews/components/ReviewForm.tsx
'use client';

import { useState } from 'react';
import { useCreateReview, useUpdateReview } from '../hooks/useReviews';
import { Button, Card, Input, StarRating, Textarea } from '@/components/ui';

interface ReviewFormProps {
  productId: string;
  reviewId?: string;
  initialRating?: number;
  initialTitle?: string;
  initialComment?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ReviewForm({
  productId,
  reviewId,
  initialRating = 0,
  initialTitle = '',
  initialComment = '',
  onSuccess,
  onCancel,
}: ReviewFormProps) {
  const createReview = useCreateReview();
  const updateReview = useUpdateReview(productId);
  const [rating, setRating] = useState(initialRating);
  const [title, setTitle] = useState(initialTitle);
  const [comment, setComment] = useState(initialComment);

  const isEditing = !!reviewId;
  const isPending = isEditing ? updateReview.isPending : createReview.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;

    if (isEditing) {
      updateReview.mutate(
        { id: reviewId, data: { rating, title: title || undefined, comment: comment || undefined } },
        { onSuccess: () => { onSuccess?.(); } }
      );
    } else {
      createReview.mutate(
        { product_id: productId, rating, title: title || undefined, comment: comment || undefined },
        { onSuccess: () => { setRating(0); setTitle(''); setComment(''); onSuccess?.(); } }
      );
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit}>
      <h3 className="font-bold text-text-primary mb-4">
        {isEditing ? 'ویرایش نظر' : 'ثبت نظر'}
      </h3>

      <div className="mb-4">
        <label className="text-sm text-text-secondary block mb-2">امتیاز شما</label>
        <StarRating rating={rating} interactive onChange={setRating} size={28} />
      </div>

      <div className="mb-4">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="عنوان نظر (اختیاری)"
          className="text-sm"
        />
      </div>

      <div className="mb-4">
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="نظر خود را بنویسید..."
          rows={4}
        />
      </div>

      <div className="flex gap-3">
        <Button type="submit" loading={isPending} disabled={rating === 0}>
          {isEditing ? 'ذخیره تغییرات' : 'ثبت نظر'}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            انصراف
          </Button>
        )}
      </div>
      </form>
    </Card>
  );
}
