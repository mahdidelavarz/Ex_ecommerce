// src/app/(admin)/admin/reviews/page.tsx
'use client';

import { useState } from 'react';
import { Icon } from '@iconify/react';
import toast from 'react-hot-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { reviewService } from '@/modules/reviews/services/review.service';
import { useAdminRoute } from '@/modules/auth/hooks/useAdminRoute';
import AdminSidebar from '@/components/layout/AdminSidebar';
import Button from '@/components/ui/Button';
import StarRating from '@/components/ui/StarRating';
import type { Review } from '@/modules/reviews/types/review.types';

export default function AdminReviewsPage() {
  const queryClient = useQueryClient();
  const { isLoading: isAuthLoading } = useAdminRoute();
  const [page, setPage] = useState(1);
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['reviews', 'admin', { page }],
    queryFn: () => reviewService.adminList({ page, limit: 20 }),
  });

  const handleApprove = async (review: Review) => {
    try {
      await reviewService.approve(review.id, !review.is_approved);
      toast.success(review.is_approved ? 'نظر رد شد' : 'نظر تایید شد');
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    } catch (error: any) {
      toast.error('خطا');
    }
  };

  const handleReply = async (reviewId: string) => {
    if (!replyText[reviewId]?.trim()) return;
    try {
      await reviewService.reply(reviewId, replyText[reviewId]);
      toast.success('پاسخ ثبت شد');
      setReplyingTo(null);
      setReplyText({ ...replyText, [reviewId]: '' });
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    } catch (error: any) {
      toast.error('خطا');
    }
  };

  const handleDelete = async (review: Review) => {
    if (!window.confirm('حذف نظر؟')) return;
    try {
      await reviewService.delete(review.id);
      toast.success('نظر حذف شد');
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    } catch (error: any) {
      toast.error('خطا');
    }
  };

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Icon icon="mdi:loading" className="animate-spin text-primary" width={48} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 lg:mr-64 p-4 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-text-primary mb-8">نظرات</h1>

          <div className="space-y-4">
            {isLoading ? (
              [...Array(3)].map((_, i) => <div key={i} className="bg-surface rounded-card p-6 animate-pulse-soft"><div className="h-16 bg-surface-raised rounded" /></div>)
            ) : data?.data?.length === 0 ? (
              <div className="text-center py-12"><p className="text-text-secondary">نظری یافت نشد</p></div>
            ) : (
              data?.data?.map((review: Review) => (
                <div key={review.id} className="bg-surface rounded-card shadow-card p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-medium">{review.user?.full_name}</p>
                      <StarRating rating={review.rating} size={14} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${review.is_approved ? 'bg-success-light text-success' : 'bg-warning-light text-warning'}`}>
                        {review.is_approved ? 'تایید شده' : 'در انتظار'}
                      </span>
                      {review.verified_purchase && (
                        <span className="bg-info-light text-info text-xs px-2 py-1 rounded-full">خریدار</span>
                      )}
                    </div>
                  </div>

                  {review.title && <p className="font-medium text-sm mb-1">{review.title}</p>}
                  {review.comment && <p className="text-text-secondary text-sm">{review.comment}</p>}

                  {review.admin_reply && (
                    <div className="mt-3 bg-primary-light/50 p-3 rounded text-sm">
                      <span className="text-xs text-primary font-medium">پاسخ:</span> {review.admin_reply}
                    </div>
                  )}

                  {/* Reply Form */}
                  {replyingTo === review.id && (
                    <div className="mt-3 flex gap-2">
                      <input
                        value={replyText[review.id] || ''}
                        onChange={(e) => setReplyText({ ...replyText, [review.id]: e.target.value })}
                        placeholder="پاسخ شما..."
                        className="flex-1 px-3 py-2 border rounded-input text-sm"
                      />
                      <Button size="sm" onClick={() => handleReply(review.id)}>ارسال</Button>
                      <Button size="sm" variant="outline" onClick={() => setReplyingTo(null)}>انصراف</Button>
                    </div>
                  )}

                  <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                    <Button size="sm" variant="outline" onClick={() => handleApprove(review)}>
                      {review.is_approved ? 'رد' : 'تایید'}
                    </Button>
                    {!replyingTo && (
                      <Button size="sm" variant="ghost" onClick={() => setReplyingTo(review.id)}>پاسخ</Button>
                    )}
                    <Button size="sm" variant="ghost" className="text-error" onClick={() => handleDelete(review)}>حذف</Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {data?.meta && data.meta.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 hover:bg-surface rounded-button disabled:opacity-50">
                <Icon icon="mdi:chevron-right" className="w-5 h-5" />
              </button>
              <span className="px-4 py-2 text-sm">{page} از {data.meta.totalPages}</span>
              <button onClick={() => setPage(p => Math.min(data.meta.totalPages, p + 1))} disabled={page === data.meta.totalPages} className="p-2 hover:bg-surface rounded-button disabled:opacity-50">
                <Icon icon="mdi:chevron-left" className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}