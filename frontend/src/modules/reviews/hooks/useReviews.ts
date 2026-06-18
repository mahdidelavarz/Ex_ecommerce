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

export function useCanReview(productId: string, enabled: boolean) {
  return useQuery({
    queryKey: ['reviews', 'can-review', productId],
    queryFn: () => reviewService.canReview(productId),
    enabled: !!productId && enabled,
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reviewService.create,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', variables.product_id] });
      queryClient.invalidateQueries({ queryKey: ['reviews', 'can-review', variables.product_id] });
      toast.success('نظر شما ثبت شد و پس از تایید نمایش داده می‌شود');
    },
    onError: (error: any) => toast.error(error.response?.data?.message || 'خطا'),
  });
}

export function useUpdateReview(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { rating?: number; title?: string; comment?: string } }) =>
      reviewService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
      queryClient.invalidateQueries({ queryKey: ['reviews', 'can-review', productId] });
      toast.success('نظر بروزرسانی شد');
    },
    onError: (error: any) => toast.error(error.response?.data?.message || 'خطا'),
  });
}

export function useMarkHelpful() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reviewService.markHelpful,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reviews'] }),
    onError: (error: any) => toast.error(error.response?.data?.message || 'خطا در ثبت رای'),
  });
}

// Admin hooks
export function useAdminReviews(params?: any) {
  return useQuery({
    queryKey: ['reviews', 'admin', params],
    queryFn: () => reviewService.adminList(params),
  });
}

export function useApproveReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, is_approved }: { id: string; is_approved: boolean }) =>
      reviewService.approve(id, is_approved),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', 'admin'] });
      toast.success('وضعیت نظر به‌روز شد');
    },
    onError: (error: any) => toast.error(error.response?.data?.message || 'خطا در به‌روزرسانی'),
  });
}

export function useReplyReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, admin_reply }: { id: string; admin_reply: string }) =>
      reviewService.reply(id, admin_reply),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', 'admin'] });
      toast.success('پاسخ ثبت شد');
    },
    onError: (error: any) => toast.error(error.response?.data?.message || 'خطا در ارسال پاسخ'),
  });
}

export function useAdminDeleteReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reviewService.adminDelete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', 'admin'] });
      toast.success('نظر حذف شد');
    },
    onError: (error: any) => toast.error(error.response?.data?.message || 'خطا در حذف'),
  });
}
