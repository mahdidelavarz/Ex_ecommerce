// src/app/(admin)/admin/reviews/page.tsx
'use client';

import { useState } from 'react';
import { useAdminRoute } from '@/modules/auth/hooks/useAdminRoute';
import AdminPage from '@/components/layout/AdminPage';
import {
  Badge,
  Button,
  EmptyState,
  Input,
  PageFilters,
  PageHeader,
  Pagination,
  Select,
  Skeleton,
  StarRating,
} from '@/components/ui';
import type { Review } from '@/modules/reviews/types/review.types';
import {
  useAdminReviews,
  useApproveReview,
  useReplyReview,
  useAdminDeleteReview,
} from '@/modules/reviews/hooks/useReviews';
import { MdiAccountCircle, MdiCommentTextOutline } from '@/components/icons/Icons';

type ApprovalFilter = 'all' | 'pending' | 'approved';

const approvalFilterOptions = [
  { value: 'pending', label: 'در انتظار' },
  { value: 'approved', label: 'تایید شده' },
];

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

  return (
    <AdminPage
      maxWidth="4xl"
      loading={isAuthLoading}
      header={<PageHeader title="نظرات" />}
      filters={
        <PageFilters>
          <Select
            value={approvalFilter === 'all' ? '' : approvalFilter}
            onChange={(e) => {
              setApprovalFilter((e.target.value || 'all') as ApprovalFilter);
              setPage(1);
            }}
            placeholder="همه نظرات"
            options={approvalFilterOptions}
          />
        </PageFilters>
      }
      footer={
        data?.meta && (
          <Pagination
            meta={data.meta}
            onPageChange={setPage}
            itemLabel="نظر"
          />
        )
      }
    >
      <div className="space-y-4">
            {isLoading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="bg-surface rounded-card p-6">
                  <Skeleton className="h-16 w-full" />
                </div>
              ))
            ) : data?.data?.length === 0 ? (
              <EmptyState icon={MdiCommentTextOutline} title="نظری یافت نشد" />
            ) : (
              data?.data?.map((review: Review) => (
                <div key={review.id} className="bg-surface rounded-card shadow-card p-5 sm:p-6">
                  {/* Header: author + status */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <MdiAccountCircle className="w-10 h-10 text-text-muted shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-text-primary truncate">
                          {review.user?.full_name || 'کاربر'}
                        </p>
                        <StarRating rating={review.rating} size={14} />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant={review.is_approved ? 'success' : 'warning'} size="sm">
                        {review.is_approved ? 'تایید شده' : 'در انتظار'}
                      </Badge>
                      {review.verified_purchase && (
                        <Badge variant="info" size="sm">خریدار</Badge>
                      )}
                    </div>
                  </div>

                  {/* Body */}
                  {review.title && (
                    <p className="font-medium text-sm mb-1 text-text-primary">{review.title}</p>
                  )}
                  {review.comment && (
                    <p className="text-text-secondary text-sm leading-relaxed">{review.comment}</p>
                  )}

                  {review.admin_reply && (
                    <div className="mt-3 bg-primary-light/50 p-3 rounded-input text-sm border-r-2 border-primary">
                      <span className="text-xs text-primary font-medium block mb-1">پاسخ فروشگاه:</span>
                      <span className="text-text-secondary">{review.admin_reply}</span>
                    </div>
                  )}

                  {/* Reply Form */}
                  {replyingTo === review.id && (
                    <div className="mt-3 flex flex-col sm:flex-row gap-2">
                      <Input
                        wrapperClassName="flex-1"
                        value={replyText[review.id] || ''}
                        onChange={(e) =>
                          setReplyText((prev) => ({ ...prev, [review.id]: e.target.value }))
                        }
                        placeholder="پاسخ شما..."
                      />
                      <div className="flex gap-2">
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
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
                    <Button
                      size="sm"
                      variant="outline"
                      loading={approveReview.isPending}
                      onClick={() => handleApprove(review)}
                    >
                      {review.is_approved ? 'رد' : 'تایید'}
                    </Button>
                    {replyingTo !== review.id && (
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
                      className="text-error ms-auto"
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
    </AdminPage>
  );
}
