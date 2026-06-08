# Module: Reviews

## Backend

| # | Issue | Severity | File |
|---|-------|----------|------|
| REV-B1 | `markHelpful()` increments `helpful_count` with no user tracking — same user can vote unlimited times | 🔴 Blocker | `review.repository.ts:122` |
| REV-B2 | Admin delete route calls the same `delete()` method that checks `user_id === reviewer` — admins cannot delete any review they don't own | 🔴 Blocker | `review.repository.ts:116`, `admin/reviews/page.tsx:53` |
| REV-B3 | All reviews auto-approved on creation (`is_approved: true`) — the entire moderation system is bypassed | 🟠 Bug | `review.repository.ts:99` |
| REV-B4 | No Zod validators for `approve` (`PATCH /:id/approve`) and `reply` (`PATCH /:id/reply`) endpoints | 🟠 Bug | `review.validator.ts`, `review.controller.ts:49,54` |
| REV-B5 | `getProductReviews` controller hardcodes `page: 1, limit: 10` in the response meta — actual query params ignored in response | 🟠 Bug | `review.controller.ts:17` |
| REV-B6 | `title` and `comment` validators allow empty string (`""`) — should use `.min(1)` if provided | 🟡 Incomplete | `review.validator.ts:7` |

## Frontend

| # | Issue | Severity | File |
|---|-------|----------|------|
| REV-F1 | `ReviewForm` shown to all authenticated users regardless of purchase history — backend marks it `verified_purchase: false` but never blocks it | 🔴 Blocker | `ReviewForm.tsx` |
| REV-F2 | Helpful vote button has no "already voted" state — user gets no feedback and can keep clicking | 🟠 Bug | `ReviewCard.tsx:60` |
| REV-F3 | Admin panel approve/reply/delete use raw `reviewService` calls with manual `invalidateQueries` instead of `useMutation` hooks — error handling is `toast.error('خطا')` with no detail | 🟠 Bug | `admin/reviews/page.tsx:27` |
| REV-F4 | Admin reviews list has no filter by approval status — backend supports `?is_approved=false` but frontend doesn't expose it | 🟡 Incomplete | `admin/reviews/page.tsx` |
| REV-F5 | No customer-facing UI to edit an existing review — backend `PATCH /:id` exists and works | 🟡 Incomplete | missing component |
| REV-F6 | `ReviewsSection` shows all reviews including unapproved ones — no client-side filter for `is_approved` | 🟡 Incomplete | `ReviewsSection.tsx` |

## Feature Completeness

| Feature | DB | Backend | Frontend |
|---------|-----|---------|----------|
| Create review | ✅ | ✅ | ✅ |
| Duplicate prevention (one per user/product) | ✅ unique constraint | ✅ checked | — |
| Purchase verification | ✅ `verified_purchase` flag | ✅ checked | ❌ no gate shown |
| Approve / reject | ✅ `is_approved` | ✅ endpoint exists | ✅ admin panel |
| Admin reply | ✅ `admin_reply` | ✅ endpoint exists | ✅ admin panel |
| Helpful votes | ✅ `helpful_count` | ⚠️ no deduplication | ⚠️ no voted state |
| Moderation filter (pending/approved) | ✅ | ✅ query param | ❌ not in admin UI |
| Edit own review | ✅ | ✅ `PATCH /:id` | ❌ no UI |
| Delete own review | ✅ | ✅ | ✅ |
| Admin delete any review | — | ❌ ownership check blocks admin | ❌ |
| Sort reviews | ✅ | ✅ `sort` param | ❌ not exposed in UI |

## Fix Solutions

### REV-B1 — Deduplicate helpful votes
Create a `review_helpful_votes` junction table or use a composite unique check:

**Option A — DB-level deduplication (recommended):**
```ts
// New entity: backend/src/database/entities/review-helpful-vote.entity.ts
@Entity('review_helpful_votes')
@Unique(['review_id', 'user_id'])
export class ReviewHelpfulVote extends BaseEntity {
  @Column() review_id: string;
  @Column() user_id: string;
}

// review.repository.ts — replace markHelpful():
async markHelpful(reviewId: string, userId: string) {
  const existing = await this.helpfulVoteRepo.findOne({
    where: { review_id: reviewId, user_id: userId }
  });
  if (existing) {
    // toggle: remove vote
    await this.helpfulVoteRepo.delete({ review_id: reviewId, user_id: userId });
    await this.reviewRepo.decrement({ id: reviewId }, 'helpful_count', 1);
    return { voted: false };
  }
  await this.helpfulVoteRepo.save({ review_id: reviewId, user_id: userId });
  await this.reviewRepo.increment({ id: reviewId }, 'helpful_count', 1);
  return { voted: true };
}
```

**Frontend — show voted state:**
```tsx
// ReviewCard.tsx — pass userVotedIds from parent or fetch alongside reviews:
const hasVoted = userVotedReviewIds?.includes(review.id) ?? false;

<button
  onClick={() => markHelpful(review.id)}
  className={hasVoted ? 'text-blue-600' : 'text-gray-500'}
>
  {hasVoted ? 'مفید بود ✓' : 'مفید بود'} ({review.helpful_count})
</button>
```

### REV-B2 — Separate admin delete from user delete
```ts
// review.repository.ts — add an adminDelete method:
async adminDelete(reviewId: string) {
  const review = await this.reviewRepo.findOne({ where: { id: reviewId } });
  if (!review) throw new NotFoundError('نظر یافت نشد');
  await this.reviewRepo.remove(review);
}

// review.routes.ts — wire to admin-only route:
router.delete('/admin/:id', authenticate, authorize(UserRole.ADMIN), asyncHandler(async (req, res) => {
  await reviewService.adminDelete(req.params.id);
  return ApiResponseHelper.noContent(res);
}));

// admin/reviews/page.tsx — call the admin endpoint:
await reviewService.adminDelete(review.id);  // hits DELETE /reviews/admin/:id
```

### REV-B3 — Disable auto-approval; require moderation
```ts
// review.repository.ts:99 — change default:
// BEFORE:
is_approved: true, // auto-approve for now

// AFTER:
is_approved: false,
```
This activates the existing moderation flow. Reviews will appear in the admin panel under a "pending" filter.
Update `ReviewsSection.tsx` to filter `is_approved === true` client-side (or pass it as a query param to the API).

### REV-B4 — Add missing Zod schemas for approve and reply
```ts
// review.validator.ts — add:
export const approveReviewSchema = z.object({
  is_approved: z.boolean({ required_error: 'وضعیت تایید الزامی است' }),
});

export const replyReviewSchema = z.object({
  admin_reply: z.string().min(1, 'پاسخ نمی‌تواند خالی باشد').max(1000),
});

// review.routes.ts — wire validate middleware:
router.patch('/:id/approve', authenticate, authorize(UserRole.ADMIN),
  validate({ body: approveReviewSchema }), controller.approve);
router.patch('/:id/reply', authenticate, authorize(UserRole.ADMIN),
  validate({ body: replyReviewSchema }), controller.reply);
```

### REV-B5 — Return actual pagination meta
```ts
// review.controller.ts — getProductReviews:
const page  = parseInt(req.query.page as string)  || 1;
const limit = parseInt(req.query.limit as string) || 10;
const { reviews, total } = await this.reviewService.getProductReviews(productId, page, limit);
return ApiResponseHelper.paginated(res, reviews, total, page, limit);
```

### REV-F1 — Gate ReviewForm on purchase history
```tsx
// ReviewsSection.tsx or product detail page — check before rendering form:
const { data: myReviews } = useMyReviews(product.id);      // did user review this?
const { data: myOrders }  = useMyOrders({ productId });    // did user buy this?

const hasPurchased  = myOrders?.some(o => o.items.some(i => i.product_id === product.id));
const hasReviewed   = myReviews?.length > 0;

{!hasReviewed && (
  hasPurchased
    ? <ReviewForm productId={product.id} />
    : <p className="text-sm text-gray-500">برای ثبت نظر باید این محصول را خریداری کرده باشید</p>
)}
```
Note: Add `useMyOrders` hook if it doesn't exist, or expose a `GET /orders?productId=` query.

### REV-F3 — Replace raw service calls with useMutation in admin panel
```tsx
// admin/reviews/page.tsx — replace inline calls with hooks:
const { mutate: approveReview } = useMutation({
  mutationFn: ({ id, is_approved }: { id: string; is_approved: boolean }) =>
    reviewService.approve(id, is_approved),
  onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-reviews'] }); toast.success('وضعیت به‌روز شد'); },
  onError:   (e: any) => toast.error(e.response?.data?.message || 'خطا در به‌روزرسانی'),
});
```

### REV-F4 — Add approval status filter to admin panel
```tsx
// admin/reviews/page.tsx — add filter state:
const [approvalFilter, setApprovalFilter] = useState<'all' | 'pending' | 'approved'>('all');

// Pass to query:
useAdminReviews({ is_approved: approvalFilter === 'all' ? undefined : approvalFilter === 'approved' })

// Render filter tabs:
<div className="flex gap-2">
  {['all','pending','approved'].map(f => (
    <button key={f} onClick={() => setApprovalFilter(f as any)}
      className={approvalFilter === f ? 'font-bold' : ''}>
      {f === 'all' ? 'همه' : f === 'pending' ? 'در انتظار' : 'تایید شده'}
    </button>
  ))}
</div>
```
