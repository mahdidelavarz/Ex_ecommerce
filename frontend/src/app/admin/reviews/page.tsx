// src/app/(admin)/admin/reviews/page.tsx
'use client';

import { useState } from 'react';
import { useAdminRoute } from '@/modules/auth/hooks/useAdminRoute';
import AdminSidebar from '@/components/layout/AdminSidebar';
import Button from '@/components/ui/Button';
import StarRating from '@/components/ui/StarRating';
import type { Review } from '@/modules/reviews/types/review.types';
import {
  useAdminReviews,
  useApproveReview,
  useReplyReview,
  useAdminDeleteReview,
} from '@/modules/reviews/hooks/useReviews';
import { MdiChevronLeft, MdiChevronRight, SvgSpinnersRingResize } from '@/components/icons/Icons';

type ApprovalFilter = 'all' | 'pending' | 'approved';

export default function AdminReviewsPage() {
  const { isLoading: isAuthLoading } = useAdminRoute();
  const [page, setPage] = useState(1);
  const [approvalFilter, setApprovalFilter] = useState<ApprovalFilter>('all');
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const queryParams = {
    page,
    limit: 20,
    ...(approvalFilter !== 'all' && { is_approved: approvalFilter === 'approved' }),
  };

  const { data, isLoading } = useAdminReviews(queryParams);
  const approveReview = useApproveReview();
  const replyReview = useReplyReview();
  const deleteReview = useAdminDeleteReview();

  const handleApprove = (review: Review) => {
    approveReview.mutate({ id: review.id, is_approved: !review.is_approved });
  };

  const handleReply = (reviewId: string) => {
    const text = replyText[reviewId]?.trim();
    if (!text) return;
    replyReview.mutate(
      { id: reviewId, admin_reply: text },
      {
        onSuccess: () => {
          setReplyingTo(null);
          setReplyText((prev) => ({ ...prev, [reviewId]: '' }));
        },
      }
    );
  };

  const handleDelete = (review: Review) => {
    if (!window.confirm('حذف نظر؟')) return;
    deleteReview.mutate(review.id);
  };

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <SvgSpinnersRingResize className="animate-spin text-primary" width={48} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 lg:mr-64 p-4 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-text-primary mb-6">نظرات</h1>

          {/* Approval Filter */}
          <div className="flex gap-2 mb-6">
            {(['all', 'pending', 'approved'] as ApprovalFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => { setApprovalFilter(f); setPage(1); }}
                className={`px-4 py-2 rounded-button text-sm font-medium transition-colors ${
                  approvalFilter === f
                    ? 'bg-primary text-white'
                    : 'bg-surface border border-border text-text-secondary hover:bg-surface-raised'
                }`}
              >
                {f === 'all' ? 'همه' : f === 'pending' ? 'در انتظار' : 'تایید شده'}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {isLoading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="bg-surface rounded-card p-6 animate-pulse-soft">
                  <div className="h-16 bg-surface-raised rounded" />
                </div>
              ))
            ) : data?.data?.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-text-secondary">نظری یافت نشد</p>
              </div>
            ) : (
              data?.data?.map((review: Review) => (
                <div key={review.id} className="bg-surface rounded-card shadow-card p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-medium">{review.user?.full_name}</p>
                      <StarRating rating={review.rating} size={14} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          review.is_approved
                            ? 'bg-success-light text-success'
                            : 'bg-warning-light text-warning'
                        }`}
                      >
                        {review.is_approved ? 'تایید شده' : 'در انتظار'}
                      </span>
                      {review.verified_purchase && (
                        <span className="bg-info-light text-info text-xs px-2 py-1 rounded-full">
                          خریدار
                        </span>
                      )}
                    </div>
                  </div>

                  {review.title && (
                    <p className="font-medium text-sm mb-1">{review.title}</p>
                  )}
                  {review.comment && (
                    <p className="text-text-secondary text-sm">{review.comment}</p>
                  )}

                  {review.admin_reply && (
                    <div className="mt-3 bg-primary-light/50 p-3 rounded text-sm">
                      <span className="text-xs text-primary font-medium">پاسخ:</span>{' '}
                      {review.admin_reply}
                    </div>
                  )}

                  {/* Reply Form */}
                  {replyingTo === review.id && (
                    <div className="mt-3 flex gap-2">
                      <input
                        value={replyText[review.id] || ''}
                        onChange={(e) =>
                          setReplyText((prev) => ({ ...prev, [review.id]: e.target.value }))
                        }
                        placeholder="پاسخ شما..."
                        className="flex-1 px-3 py-2 border rounded-input text-sm"
                      />
                      <Button
                        size="sm"
                        loading={replyReview.isPending}
                        onClick={() => handleReply(review.id)}
                      >
                        ارسال
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setReplyingTo(null)}>
                        انصراف
                      </Button>
                    </div>
                  )}

                  <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                    <Button
                      size="sm"
                      variant="outline"
                      loading={approveReview.isPending}
                      onClick={() => handleApprove(review)}
                    >
                      {review.is_approved ? 'رد' : 'تایید'}
                    </Button>
                    {!replyingTo && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setReplyingTo(review.id)}
                      >
                        پاسخ
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-error"
                      loading={deleteReview.isPending}
                      onClick={() => handleDelete(review)}
                    >
                      حذف
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {data?.meta && data.meta.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 hover:bg-surface rounded-button disabled:opacity-50"
              >
                <MdiChevronRight className="w-5 h-5" />
              </button>
              <span className="px-4 py-2 text-sm">
                {page} از {data.meta.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(data.meta.totalPages, p + 1))}
                disabled={page === data.meta.totalPages}
                className="p-2 hover:bg-surface rounded-button disabled:opacity-50"
              >
                <MdiChevronLeft className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
