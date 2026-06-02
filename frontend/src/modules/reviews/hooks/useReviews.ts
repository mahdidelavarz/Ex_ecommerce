// src/modules/reviews/hooks/useReviews.ts
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewService } from '../services/review.service';
import toast from 'react-hot-toast';

export function useProductReviews(productId: string, params?: any) {
  return useQuery({
    queryKey: ['reviews', productId, params],
    queryFn: () => reviewService.getProductReviews(productId, params),
    enabled: !!productId,
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reviewService.create,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', variables.product_id] });
      toast.success('نظر شما با موفقیت ثبت شد');
    },
    onError: (error: any) => toast.error(error.response?.data?.message || 'خطا'),
  });
}

export function useMarkHelpful() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reviewService.markHelpful,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reviews'] }),
  });
}