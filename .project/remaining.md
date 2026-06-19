# Remaining Work — Road to Production

> Status labels: 🔴 Blocker | 🟠 Bug | 🟡 Incomplete | 🔵 Hardening
> All modules through `returns` are fixed. What follows is everything still open.

---

## Infrastructure & DevOps

| # | Issue | Severity | Location |
|---|-------|----------|----------|
| I-3 | No migrations exist — production deploy with `synchronize: false` will have empty schema; run `npm run migration:generate` once DB is running, commit the output | 🔴 Blocker | `backend/src/database/migrations/` (empty) |
| I-4 | `DB_SSL=false` default — set `DB_SSL=true` in production `.env` | 🔵 Hardening | `backend/src/config/env.ts` |
| I-5 | File uploads go to `./uploads` — not safe for multi-instance; migrate to S3/object storage | 🔵 Hardening | `backend/src/config/env.ts` |

---

## Security

| # | Issue | Severity | Location |
|---|-------|----------|----------|
| S-2 | `apiLimiter` defined but never applied — only auth endpoints have rate limiting | 🟠 Bug | `backend/src/middleware/rateLimiter.ts` |
| S-3 | OTP code returned in API response body in `development` mode — safe only if `NODE_ENV` is strictly controlled | 🟡 Incomplete | `auth.service.ts:61` |

---

## Checkout (Frontend Blockers)

| # | Issue | Severity | Location |
|---|-------|----------|----------|
| F-1 | Checkout sends `addressId: 'temp-address-id'` hardcoded — backend rejects it; needs real address selector UI | 🔴 Blocker | `checkout/page.tsx` |
| F-2 | No order confirmation page or redirect after successful order placement | 🟡 Incomplete | `checkout/page.tsx` |
| F-3 | Coupon field in checkout has no validation feedback (success/error messages) | 🟡 Incomplete | `checkout/page.tsx` |

---

## Backend Cross-Cutting Bugs

| # | Issue | Severity | Location |
|---|-------|----------|----------|
| P-2 | Race condition on order number generation — uses `count() + 1`, concurrent orders can collide | 🟠 Bug | `order.repository.ts` |
| P-4 | Inventory stock check not atomic — check then decrement allows overselling under concurrent load | 🟠 Bug | `order.repository.ts` |
| P-5 | Shipping cost hardcoded as `50000` in two places — not configurable | 🟡 Incomplete | `order.repository.ts` + `checkout/page.tsx` |
| P-6 | Tax hardcoded to `0` — no calculation or config | 🟡 Incomplete | `order.repository.ts` |

**Fix P-2 / P-4 — atomic reserve with a DB transaction:**
```ts
// order.repository.ts — wrap stock check + decrement in a transaction:
await this.dataSource.transaction(async (manager) => {
  const variant = await manager
    .createQueryBuilder(ProductVariant, 'v')
    .setLock('pessimistic_write')
    .where('v.id = :id', { id: variantId })
    .getOneOrFail();

  if (variant.stock_quantity < qty) throw new BadRequestError('موجودی کافی نیست');
  await manager.decrement(ProductVariant, { id: variantId }, 'stock_quantity', qty);
});
```
For order numbers, use a DB sequence or append a timestamp + random suffix similar to the returns pattern (`ORD-{year}-{ts}-{random4}`).

---

## Products Module

| # | Issue | Severity | Location |
|---|-------|----------|----------|
| PRD-B6 | `bulkStatus()` not transactional — partial failure leaves products in mixed state | 🟡 Incomplete | `product.service.ts` |
| PRD-F8 | No SEO metadata on product detail — `'use client'` prevents `generateMetadata` | 🟡 Incomplete | `products/[slug]/page.tsx` |
| PRD-F10 | Admin product form accepts image URL strings only — no file upload UI | 🟡 Incomplete | `admin/products/[id]/page.tsx` |
| PRD-F11 | Variant images cannot be managed from admin UI | 🟡 Incomplete | `admin/products/[id]/variants/page.tsx` |
| PRD-F12 | Product `specification` field has no form editor in admin | 🟡 Incomplete | `admin/products/[id]/page.tsx` |

**Fix PRD-F8** — split page into RSC shell + client island:
```tsx
// app/products/[slug]/page.tsx — keep as RSC, extract interactive parts:
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { data: product } = await productService.getBySlug(params.slug);
  const thumbnail = product.images.find(i => i.is_thumbnail)?.image_url ?? '';
  return {
    title: product.seo?.title ?? product.title,
    description: product.seo?.description ?? product.short_description,
    openGraph: { images: thumbnail ? [{ url: thumbnail, alt: product.title }] : [] },
  };
}
```

---

## Reviews Module

All issues below are open — this module has not been touched yet.

### Backend

| # | Issue | Severity | Location |
|---|-------|----------|----------|
| REV-B1 | `markHelpful()` no user tracking — same user can vote unlimited times | 🔴 Blocker | `review.repository.ts:122` |
| REV-B2 | Admin delete calls user-owned `delete()` — ownership check blocks admin deletes | 🔴 Blocker | `review.repository.ts:116` |
| REV-B3 | All reviews auto-approved on creation (`is_approved: true`) — moderation bypassed | 🟠 Bug | `review.repository.ts:99` |
| REV-B4 | No Zod validators for `approve` (`PATCH /:id/approve`) and `reply` (`PATCH /:id/reply`) | 🟠 Bug | `review.validator.ts` |
| REV-B5 | `getProductReviews` hardcodes `page: 1, limit: 10` in response meta — actual params ignored | 🟠 Bug | `review.controller.ts:17` |
| REV-B6 | `title` and `comment` validators allow empty string — should use `.min(1)` | 🟡 Incomplete | `review.validator.ts:7` |

**Fix REV-B1** — create `review_helpful_votes` junction:
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
  const existing = await this.helpfulVoteRepo.findOne({ where: { review_id: reviewId, user_id: userId } });
  if (existing) {
    await this.helpfulVoteRepo.delete({ review_id: reviewId, user_id: userId });
    await this.reviewRepo.decrement({ id: reviewId }, 'helpful_count', 1);
    return { voted: false };
  }
  await this.helpfulVoteRepo.save({ review_id: reviewId, user_id: userId });
  await this.reviewRepo.increment({ id: reviewId }, 'helpful_count', 1);
  return { voted: true };
}
```

**Fix REV-B2** — separate admin delete:
```ts
// review.repository.ts — add:
async adminDelete(reviewId: string) {
  const review = await this.reviewRepo.findOneOrFail({ where: { id: reviewId } });
  await this.reviewRepo.remove(review);
}

// review.routes.ts — add admin-only route:
router.delete('/admin/:id', authenticate, authorize(UserRole.ADMIN), asyncHandler(async (req, res) => {
  await reviewService.adminDelete(req.params.id);
  return ApiResponseHelper.noContent(res);
}));
```

**Fix REV-B3** — disable auto-approval:
```ts
// review.repository.ts:99 — change:
is_approved: false,  // was: true
```
Then filter `is_approved === true` in `ReviewsSection.tsx` (fixes REV-F6 simultaneously).

**Fix REV-B4** — add missing validators:
```ts
// review.validator.ts:
export const approveReviewSchema = z.object({ is_approved: z.boolean() });
export const replyReviewSchema   = z.object({ admin_reply: z.string().min(1).max(1000) });

// review.routes.ts — wire:
router.patch('/:id/approve', authenticate, authorize(UserRole.ADMIN), validate({ body: approveReviewSchema }), controller.approve);
router.patch('/:id/reply',   authenticate, authorize(UserRole.ADMIN), validate({ body: replyReviewSchema }),   controller.reply);
```

**Fix REV-B5** — real pagination meta:
```ts
// review.controller.ts — getProductReviews:
const page  = parseInt(req.query.page  as string) || 1;
const limit = parseInt(req.query.limit as string) || 10;
const { reviews, total } = await this.reviewService.getProductReviews(productId, page, limit);
return ApiResponseHelper.paginated(res, reviews, total, page, limit);
```

### Frontend

| # | Issue | Severity | Location |
|---|-------|----------|----------|
| REV-F1 | `ReviewForm` shown to all authenticated users — no purchase-history gate | 🔴 Blocker | `ReviewForm.tsx` |
| REV-F2 | Helpful vote button has no "already voted" state | 🟠 Bug | `ReviewCard.tsx:60` |
| REV-F3 | Admin approve/reply/delete use raw service calls — no `useMutation`, minimal error detail | 🟠 Bug | `admin/reviews/page.tsx:27` |
| REV-F4 | Admin reviews list has no approval-status filter (`?is_approved=false` supported but not exposed) | 🟡 Incomplete | `admin/reviews/page.tsx` |
| REV-F5 | No customer UI to edit an existing review — backend `PATCH /:id` exists | 🟡 Incomplete | missing component |
| REV-F6 | `ReviewsSection` shows unapproved reviews — no `is_approved` filter | 🟡 Incomplete | `ReviewsSection.tsx` |

**Fix REV-F1** — gate on purchase history:
```tsx
// ReviewsSection.tsx or product detail:
const hasPurchased = myOrders?.some(o => o.items.some(i => i.product_id === product.id));
const hasReviewed  = myReviews?.length > 0;

{!hasReviewed && (hasPurchased
  ? <ReviewForm productId={product.id} />
  : <p className="text-sm text-gray-500">برای ثبت نظر باید این محصول را خریداری کرده باشید</p>
)}
```

**Fix REV-F3** — replace raw calls with `useMutation`:
```tsx
const { mutate: approveReview } = useMutation({
  mutationFn: ({ id, is_approved }: { id: string; is_approved: boolean }) =>
    reviewService.approve(id, is_approved),
  onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-reviews'] }); toast.success('وضعیت به‌روز شد'); },
  onError:   (e: any) => toast.error(e.response?.data?.message || 'خطا در به‌روزرسانی'),
});
```

---

## Admin Panel — Missing Pages

| Page | Notes |
|------|-------|
| Dashboard / overview | `/admin` has no landing page — no stats, KPIs, or quick links |
| Users management | No UI to list users, view profiles, or change roles |
| Shipments standalone | Shipments only accessible inside order detail; no `/admin/shipments` list |

---

## SEO

### Critical
| # | Task |
|---|------|
| SEO-P1 | Create `/categories/[slug]` page — linked from mega menu, mobile menu, breadcrumb; hits 404 |
| SEO-M1 | `generateMetadata` on `products/[slug]` (= PRD-F8 above) |
| SEO-M2 | `Product` JSON-LD on product detail (price, availability, rating in search results) |
| SEO-S1 | `app/sitemap.ts` — dynamic sitemap for products, categories, brands |
| SEO-L5 | Breadcrumb category link hits 404 — blocked by SEO-P1 |

### High
| # | Task |
|---|------|
| SEO-P2 | Create `/brands/[slug]` page |
| SEO-P3 | Create `/brands` listing page — no entry point exists |
| SEO-S2 | `app/robots.ts` — robots.txt with sitemap link |
| SEO-M3 | `generateMetadata` on `/categories/[slug]` and `/brands/[slug]` |
| SEO-SD2 | `BreadcrumbList` JSON-LD on product detail and category pages |
| SEO-SD3 | `Organization` JSON-LD in `app/layout.tsx` |
| SEO-L1 | Render related products on product detail (backend endpoint now works after PRD-B1 fix) |
| SEO-L2 | Tag chips on product detail should link to `/products?tag=slug` |
| SEO-L4 | Brand name on product detail should link to `/brands/[slug]` |

### Medium
| # | Task |
|---|------|
| SEO-LANG | Set `lang="fa" dir="rtl"` on `<html>` in `app/layout.tsx` |
| SEO-ALT | Add meaningful `alt` text to all images (product cards, product detail, brand logos) |
| SEO-SSG | `generateStaticParams` + `revalidate = 3600` on product/category/brand pages |
| SEO-SD4 | `WebSite` + `SearchAction` JSON-LD in root layout |

### Low
| # | Task |
|---|------|
| SEO-H1 | Audit heading hierarchy — each page needs exactly one `<h1>` |
| SEO-SD5 | `ItemList` JSON-LD on product listing and category pages |

**Sitemap template:**
```ts
// app/sitemap.ts
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://yoursite.com';
  const [products, categories, brands] = await Promise.all([
    productService.getAllSlugs(),
    categoryService.getAllSlugs(),
    brandService.getAllSlugs(),
  ]);
  return [
    { url: BASE, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    ...products.map(p => ({ url: `${BASE}/products/${p.slug}`, lastModified: p.updated_at, changeFrequency: 'weekly' as const, priority: 0.8 })),
    ...categories.map(c => ({ url: `${BASE}/categories/${c.slug}`, lastModified: c.updated_at, changeFrequency: 'weekly' as const, priority: 0.7 })),
    ...brands.map(b => ({ url: `${BASE}/brands/${b.slug}`, lastModified: b.updated_at, changeFrequency: 'monthly' as const, priority: 0.6 })),
  ];
}
```

**Robots template:**
```ts
// app/robots.ts
export default function robots(): MetadataRoute.Robots {
  const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://yoursite.com';
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin/', '/checkout/', '/api/'] }],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
```

---

## Open Questions & Inconsistencies

| # | Question / Issue |
|---|-----------------|
| Q4 | `UserRole.SUPPORT` exists in enums but no route uses `authorize(UserRole.SUPPORT)` — support role is defined but has no distinct permissions |
| D1 | Cart guest session — how is `sessionId` generated and persisted client-side? Check `cart.store.ts` |
| D2 | File uploads — is `./uploads` being served as static files? Verify static middleware setup |
| D3 | OTP in dev — no way to test without a paid Kavenegar key; consider a dev bypass env flag |
| INC-1 | `payment` frontend module is `frontend/src/modules/payment/` (singular) — all other modules are plural |
| INC-2 | Variant routes mounted at root prefix in `app.ts` (not `/variants`) — `GET /api/v1/products/:id/variants` |
