# Remaining Work

_Last updated: 2026-06-19_

> 🔴 Critical | 🟠 High | 🟡 Medium | 🔵 Low

---

## 🔴 Critical

### ~~C-1 — CSRF Protection Missing~~ ✅ Fixed
`backend/src/middleware/csrf.ts` — `csrfProtection` middleware validates `Origin`/`Referer` header on all mutating methods; mounted in `app.ts` after `cookieParser`. `cors.ts` also updated to use `env.cors.origin` instead of hardcoded value.

---

### ~~C-2 — No Database Migrations~~ ✅ Fixed
`backend/src/database/migrations/1749980000000-InitialSchema.ts` — hand-written migration creates all 31 tables, 9 enum types, all FK constraints, non-unique indexes, and the two partial-unique indexes (`UQ_payments_transaction_id`, `uq_user_default_shipping`). Runs before `SetAdminUser` (timestamp 1749980000000 < 1750071600000). Deploy with `npm run migration:run`.

---

### C-3 — Checkout Uses Hardcoded Address ID
**File:** `frontend/src/app/checkout/page.tsx`
Checkout sends `addressId: 'temp-address-id'` — backend rejects it. No order can be placed.
**Fix:** Add an address selector UI in checkout. Fetch `GET /users/addresses`, let the user pick one, and pass the real UUID.

---

### ~~C-4 — `markHelpful()` Has No User Deduplication~~ ✅ Fixed
`review-helpful-vote.entity.ts` — `@Unique(['review_id', 'user_id'])` junction table. `review.repository.ts:markHelpful()` — toggle logic with decrement/increment and `user_has_voted` returned in `findByProduct`.

---

### ~~C-5 — Admin Cannot Delete Reviews~~ ✅ Fixed
`review.repository.ts:adminDelete()` — no ownership check. `review.routes.ts:29` — `DELETE /admin/:id` with `authenticate + authorize(UserRole.ADMIN)`. Full chain: repository → service → controller → route.

---

### ~~C-6 — ReviewForm Shown Without Purchase Verification~~ ✅ Fixed
`ReviewsSection.tsx:107` — `<ReviewForm>` gated behind `canSubmitNew && !alreadyReviewed` from `useCanReview()` (server-authoritative purchase check). `notPurchased` path shows the "باید این محصول را خریداری کرده باشید" message.

---

### ~~C-7 — `/categories/[slug]` Page Missing (404)~~ ✅ Fixed
`frontend/src/app/categories/[slug]/page.tsx` — category header (image/icon/description/sub-category chips), breadcrumb with parent, sort bar, `ProductGrid`, URL-based pagination.

---

### ~~C-8 — No SEO Metadata on Product Detail~~ ✅ Fixed
`products/[slug]/page.tsx` — server component shell with `generateMetadata` (native `fetch`, 1h revalidate); sets `title`, `description`, `openGraph`. Interactive content extracted to `ProductPageClient.tsx` (client component).

---

### ~~C-9 — No `Product` JSON-LD on Product Detail~~ ✅ Fixed
`frontend/src/app/products/[slug]/page.tsx` — `ProductPage` is now async; fetches product server-side (Next.js deduplicates the fetch with `generateMetadata`). `buildProductJsonLd()` derives `minPrice`/`inStock` from active variants, emits `Product` schema with `Offer`, `Brand`, and conditional `AggregateRating`. Script tag injected above `<ProductPageClient />`.

---

### ~~C-10 — No Sitemap~~ ✅ Fixed
`frontend/src/app/sitemap.ts` — dynamic `MetadataRoute.Sitemap` fetching all active+public products, active categories, and active brands via parallel `fetch()` calls. Revalidates hourly (`export const revalidate = 3600`). Errors per-source are swallowed (returns `[]`) so a backend outage on one endpoint doesn't break the whole sitemap.

---

### ~~C-11 — Breadcrumb Category Link → 404~~ ✅ Fixed
Unblocked by C-7. `/categories/[slug]` now exists so breadcrumb links resolve correctly.

---

## 🟠 High

### ~~H-1 — OTP Endpoints Have No IP-Level Rate Limit~~ ✅ Already done
`rateLimiter.ts` — `authLimiter` (15-min window, max 5 requests) already exists. `auth.routes.ts:20-21` — already mounted on both `POST /send-otp` and `POST /verify-otp`.

---

### ~~H-2 — General `apiLimiter` Never Applied to Routes~~ ✅ Fixed
`backend/src/app.ts` — imported `apiLimiter` and mounted `app.use(apiPrefix, apiLimiter)` before all route registrations.

---

### ~~H-3 — Admin Pages Have No Frontend Role Guard~~ ✅ Fixed
`frontend/src/app/admin/AdminGuard.tsx` — client component that calls `useAdminRoute()` (redirect to `/login` if not authenticated, to `/` if not admin) and renders `null` during auth initialization. `admin/layout.tsx` wraps all children with `<AdminGuard>`, centralising protection across all 18 admin pages.

---

### ~~H-4 — Coupon Can Be Applied Multiple Times per User~~ ✅ Already done
`coupon.repository.ts:235-242` — `validate()` counts `orders WHERE coupon_id = ? AND user_id = ?` against `usage_per_user` and throws. `order.repository.ts:154-161` — same check repeated inside the order-creation transaction (double enforcement). No separate `coupon_usages` table needed.

---

### ~~H-5 — Race Condition on Order Number Generation~~ ✅ Fixed
`order.repository.ts` — replaced `count() + 1` with `NZS-{year}-{Date.now()}-{rand4}` (millisecond timestamp + 4-char base-36 random suffix).

---

### ~~H-6 — Inventory Stock Check Not Atomic~~ ✅ Fixed
`order.repository.ts` — replaced `findOne` with a QueryBuilder using `.setLock('pessimistic_write')` (`SELECT … FOR UPDATE`) for each variant inside the existing transaction. Concurrent orders now serialize at the DB row level; the second request blocks until the first commits, then sees the updated stock count.

---

### H-7 — All Reviews Auto-Approved on Creation
**File:** `backend/src/modules/reviews/review.repository.ts:99`
`is_approved: true` on create bypasses the entire moderation system.
**Fix:** Change to `is_approved: false`. Filter `is_approved === true` in `ReviewsSection.tsx` (fixes H-11 simultaneously).

---

### H-8 — No Zod Validators for `approve` / `reply` Endpoints
**File:** `backend/src/modules/reviews/review.validator.ts`
`PATCH /:id/approve` and `PATCH /:id/reply` accept raw request bodies with no validation.
**Fix:**
```ts
export const approveReviewSchema = z.object({ is_approved: z.boolean() });
export const replyReviewSchema   = z.object({ admin_reply: z.string().min(1).max(1000) });
// wire via validate() middleware on both routes
```

---

### H-9 — `getProductReviews` Hardcodes Pagination Meta
**File:** `backend/src/modules/reviews/review.controller.ts:17`
Response always returns `page: 1, limit: 10` regardless of actual query params.
**Fix:**
```ts
const page  = parseInt(req.query.page  as string) || 1;
const limit = parseInt(req.query.limit as string) || 10;
return ApiResponseHelper.paginated(res, reviews, total, page, limit);
```

---

### H-10 — Helpful Vote Button Has No "Already Voted" State
**File:** `frontend/src/modules/reviews/components/ReviewCard.tsx:60`
User gets no feedback and can keep clicking.
**Fix:**
```tsx
const hasVoted = userVotedReviewIds?.includes(review.id) ?? false;
<button onClick={() => markHelpful(review.id)} className={hasVoted ? 'text-blue-600' : 'text-gray-500'}>
  {hasVoted ? 'مفید بود ✓' : 'مفید بود'} ({review.helpful_count})
</button>
```

---

### H-11 — Admin Review Actions Use Raw Service Calls
**File:** `frontend/src/app/admin/reviews/page.tsx:27`
Approve / reply / delete use direct `reviewService.*` calls with manual `invalidateQueries`. No loading state, no typed error detail.
**Fix:** Replace with `useMutation` hooks (pattern used in every other module):
```tsx
const { mutate: approveReview } = useMutation({
  mutationFn: ({ id, is_approved }: { id: string; is_approved: boolean }) => reviewService.approve(id, is_approved),
  onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-reviews'] }); toast.success('وضعیت به‌روز شد'); },
  onError: (e: any) => toast.error(e.response?.data?.message || 'خطا'),
});
```

---

### H-12 — `/brands/[slug]` Page Missing
**File:** `frontend/src/app/brands/[slug]/` (does not exist)
Brand name on product detail links here — currently 404.

---

### H-13 — `/brands` Listing Page Missing
**File:** `frontend/src/app/brands/` (does not exist)
No entry point to browse brands.

---

### H-14 — No `robots.txt`
**File:** `frontend/src/app/robots.ts` (does not exist)
**Fix:**
```ts
export default function robots(): MetadataRoute.Robots {
  const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://yoursite.com';
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin/', '/checkout/', '/api/'] }],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
```

---

### H-15 — `generateMetadata` Missing on Category + Brand Pages
**File:** `frontend/src/app/categories/[slug]/`, `frontend/src/app/brands/[slug]/`
Blocked by C-7 and H-12. Add once those pages exist.

---

### H-16 — `BreadcrumbList` JSON-LD Missing
**File:** `frontend/src/app/products/[slug]/page.tsx`, `frontend/src/app/categories/[slug]/`
No structured breadcrumb data — search snippets show no path.

---

### H-17 — `Organization` JSON-LD Missing in Root Layout
**File:** `frontend/src/app/layout.tsx`
No brand identity signal for Google's knowledge panel.
**Fix:**
```tsx
const orgJsonLd = {
  '@context': 'https://schema.org', '@type': 'Organization',
  name: 'نام فروشگاه', url: 'https://yoursite.com', logo: 'https://yoursite.com/logo.png',
};
<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
```

---

### H-18 — Related Products Not Rendered on Product Detail
**File:** `frontend/src/app/products/[slug]/page.tsx`
Backend `GET /:slug/related` works (route order fixed), but frontend does not fetch or render it.

---

### H-19 — Tag Chips on Product Detail Don't Link to Filter URL
**File:** `frontend/src/app/products/[slug]/page.tsx`
Tags render as visual chips only — no link to `/products?tag=slug`.

---

### H-20 — Brand Name on Product Detail Has No Link
**File:** `frontend/src/app/products/[slug]/page.tsx`
Brand name should link to `/brands/[slug]`. Blocked by H-12.

---

## 🟡 Medium

### M-1 — `DB_SSL=false` Default
**File:** `backend/src/config/env.ts`
Set `DB_SSL=true` in production `.env`.

---

### M-2 — File Uploads Not S3-Ready
**File:** `backend/src/config/env.ts`
Uploads go to `./uploads` — single-instance restarts are safe (volume-mounted), but multi-instance deploys will not share the folder. Migrate to S3/object storage before scaling.

---

### M-3 — OTP Code Exposed in Dev API Response
**File:** `backend/src/modules/auth/auth.service.ts:61`
OTP returned in response body in `development` mode. Safe only if `NODE_ENV` is strictly controlled; remove or gate behind an explicit `EXPOSE_OTP=true` env flag.

---

### M-4 — Shipping Cost Hardcoded
**Files:** `backend/src/modules/orders/order.repository.ts`, `frontend/src/app/checkout/page.tsx`
`50000` Toman hardcoded in two places. Make it a config value or a per-region setting.

---

### M-5 — Tax Hardcoded to Zero
**File:** `backend/src/modules/orders/order.repository.ts`
No tax calculation or config. Add a `TAX_RATE` env variable and apply it during order totalling.

---

### M-6 — No Order Confirmation Page After Checkout
**File:** `frontend/src/app/checkout/page.tsx`
After a successful order, there is no redirect to a confirmation page — user is left on the checkout page.
**Fix:** On payment success, redirect to `/orders/[id]?confirmed=true` and show a success banner.

---

### M-7 — Coupon Validation Feedback Missing in Checkout
**File:** `frontend/src/app/checkout/page.tsx`
The coupon field has no success/error display after the user applies a code.

---

### M-8 — `bulkStatus()` Not Transactional
**File:** `backend/src/modules/products/product.service.ts`
Bulk status update has no transaction — partial failure leaves some products updated and others not.

---

### M-9 — Admin Product: No File Upload UI
**File:** `frontend/src/app/admin/products/[id]/page.tsx`
Image management accepts URL strings only. Backend supports `multipart/form-data` via multer. Add a file `<input>` with upload-on-select.

---

### M-10 — Variant Images Not Manageable in Admin
**File:** `frontend/src/app/admin/products/[id]/variants/page.tsx`
No UI to add or remove variant-specific images.

---

### M-11 — Product `specification` Field Has No Editor in Admin
**File:** `frontend/src/app/admin/products/[id]/page.tsx`
The field is not present in the admin form.

---

### M-12 — Review `title` / `comment` Allow Empty String
**File:** `backend/src/modules/reviews/review.validator.ts:7`
Change to `.min(1)` so empty-string submissions are rejected.

---

### M-13 — Admin Reviews: No Approval Status Filter
**File:** `frontend/src/app/admin/reviews/page.tsx`
Backend supports `?is_approved=false` but the admin UI has no filter tabs. All reviews shown in one list.

---

### M-14 — No Customer UI to Edit an Existing Review
**File:** missing component in `frontend/src/modules/reviews/components/`
Backend `PATCH /reviews/:id` exists and works.

---

### M-15 — `ReviewsSection` Shows Unapproved Reviews
**File:** `frontend/src/modules/reviews/components/ReviewsSection.tsx`
No `is_approved` filter — pending/rejected reviews visible to customers. Fixed automatically once H-7 sets `is_approved: false` on create and a filter is added here.

---

### M-16 — Admin Panel: Dashboard / Overview Missing
`/admin` has no landing page — no stats, KPIs, or quick links. Admin is dropped directly into a blank route.

---

### M-17 — Admin Panel: Users Management Missing
No UI to list users, view profiles, search, or change roles.

---

### M-18 — Admin Panel: Shipments Standalone Page Missing
Shipments are only accessible inside individual order detail. No `/admin/shipments` list for dispatch operations.

---

### M-19 — Magic Numbers Scattered Across Codebase
**Files:** `backend/src/modules/auth/auth.service.ts`, `backend/src/middleware/rateLimiter.ts`
OTP expiry, token TTLs, and rate-limit windows are hardcoded inline.
**Fix:** `backend/src/shared/constants/config.constants.ts`:
```ts
export const AUTH = {
  OTP_EXPIRY_MS: 10 * 60 * 1000,
  OTP_MAX_ATTEMPTS: 3,
  ACCESS_TOKEN_TTL: '45m',
  REFRESH_TOKEN_TTL: '120d',
};
```

---

### M-20 — `req.user` Module Augmentation Inconsistent
**File:** `backend/src/middleware/auth.ts`, various controllers
Some controllers use `as unknown as AuthenticatedUser` casts, bypassing type safety.
**Fix:** `backend/src/types/express.d.ts`:
```ts
declare global {
  namespace Express {
    interface Request { user?: UserPayload; requestId?: string; }
  }
}
```

---

### M-21 — No React Error Boundaries
**File:** `frontend/src/app/layout.tsx`
A runtime error in any component crashes the entire app with a white screen.
**Fix:** Add `ErrorBoundary.tsx` (class component with `componentDidCatch`) to layout, plus `error.tsx` inside each major route segment.

---

### M-22 — React Query Default `staleTime` is Zero
**File:** `frontend/src/lib/query-provider.tsx`
Every window-focus refetches all queries — categories and brands are fetched repeatedly.
**Fix:**
```ts
const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 5 * 60 * 1000, retry: 1 } },
});
```
Override per-query for real-time data (cart, orders).

---

### M-23 — Cart Quantity Bounds Not Validated
**File:** `backend/src/modules/cart/cart.validator.ts`
A user can add `quantity: -1` or `quantity: 99999`.
**Fix:** `z.number().int().min(1).max(100)` in the cart Zod schema. Also validate against `variant.stock_quantity`.

---

### M-24 — No Optimistic UI for Cart
**File:** `frontend/src/modules/cart/hooks/`
Add-to-cart waits for a full server round-trip. Use `onMutate` + `onError` rollback pattern for instant feedback.

---

### M-25 — `InventoryLog` Entity Is Dead Code
**File:** `backend/src/database/entities/inventory-log.entity.ts`
Entity is registered with TypeORM but never written to. Wire it into every stock change: order placed, order cancelled, return received, manual adjustment.

---

### M-26 — Incomplete Return Workflow
**File:** `backend/src/modules/returns/return.service.ts`
When a return is approved the system does not restore stock or trigger a refund.
**Fix:**
1. On status → `received`: increment `variant.stock_quantity` inside a transaction + write `InventoryLog`.
2. On status → `refunded`: call Zarinpal refund endpoint; record `refund_triggered_at`.

---

### M-27 — `lang="fa" dir="rtl"` Missing on `<html>`
**File:** `frontend/src/app/layout.tsx`
```tsx
<html lang="fa" dir="rtl">
```

---

### M-28 — Missing `alt` Text on Images
**Files:** `frontend/src/modules/products/components/ProductCard.tsx`, `frontend/src/app/products/[slug]/page.tsx`
`alt=""` or missing entirely. Add `alt={product.title}`, `alt={`لوگوی ${brand.name}`}`, etc.

---

### M-29 — `generateStaticParams` + ISR Not Set Up
**Files:** `frontend/src/app/products/[slug]/`, `frontend/src/app/categories/[slug]/`, `frontend/src/app/brands/[slug]/`
Pre-render top pages at build time for instant TTFB:
```ts
export async function generateStaticParams() {
  const { data } = await productService.getAll({ limit: 200, sort: 'sales_desc' });
  return data.items.map(p => ({ slug: p.slug }));
}
export const revalidate = 3600;
```

---

### M-30 — `WebSite` + `SearchAction` JSON-LD Missing
**File:** `frontend/src/app/layout.tsx`
Enables Google sitelinks searchbox.

---

## 🔵 Low

### L-1 — Add OpenAPI / Swagger Documentation
**File:** `backend/src/app.ts`
Zero API documentation. Use `swagger-jsdoc` + `swagger-ui-express` or `tsoa`.

---

### L-2 — Add Test Coverage
Zero tests in the entire project.
- Backend: `vitest` + `supertest` + `testcontainers`
- Frontend: `vitest` + `@testing-library/react`
- E2E: `Playwright`
Start with auth flow, order creation, and coupon validation.

---

### L-3 — Add Redis Caching for Static Lists
**Files:** `backend/src/modules/categories/category.service.ts`, `backend/src/modules/brands/brand.service.ts`
Category and brand lists are requested on every product page but rarely change. Cache with a 10-minute TTL.

---

### L-4 — Add Email Notifications
Order confirmation, shipment update, return status, OTP fallback via Resend or Nodemailer.

---

### L-5 — Pin Docker Image Versions
**Files:** `backend/Dockerfile`, `frontend/Dockerfile`, `docker-compose.yml`
`:latest` tags make builds non-reproducible. Pin: `node:20.15.1-alpine`, `postgres:16.3-alpine`.

---

### L-6 — Audit Heading Hierarchy
Each page needs exactly one `<h1>`. Product listing may have none; product detail may have multiples.

---

### L-7 — `ItemList` JSON-LD on Product Listing + Category Pages
Low-priority structured data for product list rich results.

---

## Open Questions

| # | Question |
|---|----------|
| Q-1 | `UserRole.SUPPORT` exists in enums but no route uses `authorize(UserRole.SUPPORT)` — define what support can access |
| Q-2 | Cart guest session — how is `sessionId` generated and persisted client-side? Check `cart.store.ts` |
| Q-3 | File uploads — is `./uploads` being served as static files? Verify static middleware in `app.ts` |
| Q-4 | OTP in dev — no way to test without a paid Kavenegar key; add a `EXPOSE_OTP=true` dev flag |
| Q-5 | `payment` frontend module is `frontend/src/modules/payment/` (singular) — all others are plural; align naming |
| Q-6 | Variant routes mounted at root prefix in `app.ts` — intentional or oversight? |

---

## Summary Checklist

| # | Item | Priority | Effort |
|---|------|----------|--------|
| C-1 | CSRF protection | 🔴 | Low |
| ~~C-2~~ | ~~Generate initial DB migration~~ ✅ | 🔴 | Low |
| C-3 | Real address selector in checkout | 🔴 | Medium |
| ~~C-4~~ | ~~Review helpful vote deduplication~~ ✅ | 🔴 | Medium |
| ~~C-5~~ | ~~Admin delete reviews (ownership fix)~~ ✅ | 🔴 | Low |
| C-6 | Gate ReviewForm on purchase history | 🔴 | Low |
| ~~C-7~~ | ~~Create `/categories/[slug]` page~~ ✅ | 🔴 | Medium |
| ~~C-8~~ | ~~`generateMetadata` on product detail~~ ✅ | 🔴 | Low |
| ~~C-9~~ | ~~`Product` JSON-LD on product detail~~ ✅ | 🔴 | Low |
| ~~C-10~~ | ~~`app/sitemap.ts` dynamic sitemap~~ ✅ | 🔴 | Low |
| ~~C-11~~ | ~~Fix breadcrumb category link~~ ✅ | 🔴 | — |
| ~~H-1~~ | ~~IP-level rate limit on OTP endpoints~~ ✅ | 🟠 | Low |
| ~~H-2~~ | ~~Apply `apiLimiter` to all routes~~ ✅ | 🟠 | Low |
| ~~H-3~~ | ~~Admin frontend role guard~~ ✅ | 🟠 | Low |
| ~~H-4~~ | ~~Per-user coupon usage limit~~ ✅ | 🟠 | Medium |
| ~~H-5~~ | ~~Order number race condition~~ ✅ | 🟠 | Low |
| ~~H-6~~ | ~~Atomic stock decrement on order~~ ✅ | 🟠 | Medium |
| H-7 | Disable review auto-approval | 🟠 | Low |
| H-8 | Zod validators for approve/reply | 🟠 | Low |
| H-9 | Fix review pagination meta | 🟠 | Low |
| H-10 | Helpful vote "already voted" state | 🟠 | Low |
| H-11 | Admin reviews → useMutation hooks | 🟠 | Low |
| H-12 | Create `/brands/[slug]` page | 🟠 | Medium |
| H-13 | Create `/brands` listing page | 🟠 | Low |
| H-14 | `app/robots.ts` | 🟠 | Low |
| H-15 | Metadata on category + brand pages | 🟠 | Low |
| H-16 | BreadcrumbList JSON-LD | 🟠 | Low |
| H-17 | Organization JSON-LD in root layout | 🟠 | Low |
| H-18 | Render related products on detail page | 🟠 | Low |
| H-19 | Tag chips link to filter URL | 🟠 | Low |
| H-20 | Brand name links to brand page | 🟠 | Low |
| M-1 | DB_SSL=true in production | 🟡 | Low |
| M-2 | S3 for uploads (multi-instance) | 🟡 | High |
| M-3 | Remove OTP from dev API response | 🟡 | Low |
| M-4 | Configurable shipping cost | 🟡 | Low |
| M-5 | Tax calculation / config | 🟡 | Medium |
| M-6 | Order confirmation page | 🟡 | Low |
| M-7 | Coupon validation feedback in checkout | 🟡 | Low |
| M-8 | `bulkStatus()` transaction | 🟡 | Low |
| M-9 | Product image file upload in admin | 🟡 | Medium |
| M-10 | Variant image management in admin | 🟡 | Medium |
| M-11 | Specification field editor in admin | 🟡 | Low |
| M-12 | Review title/comment `.min(1)` | 🟡 | Low |
| M-13 | Admin reviews approval filter | 🟡 | Low |
| M-14 | Customer edit-review UI | 🟡 | Low |
| M-15 | Filter unapproved reviews in section | 🟡 | Low |
| M-16 | Admin dashboard page | 🟡 | Medium |
| M-17 | Admin users management page | 🟡 | High |
| M-18 | Admin shipments list page | 🟡 | Medium |
| M-19 | Centralize magic numbers | 🟡 | Low |
| M-20 | Fix req.user module augmentation | 🟡 | Low |
| M-21 | React error boundaries | 🟡 | Low |
| M-22 | React Query staleTime | 🟡 | Low |
| M-23 | Cart quantity bounds validation | 🟡 | Low |
| M-24 | Optimistic UI for cart | 🟡 | Medium |
| M-25 | Wire InventoryLog | 🟡 | Medium |
| M-26 | Return: stock restore + refund trigger | 🟡 | High |
| M-27 | `lang="fa" dir="rtl"` on `<html>` | 🟡 | Low |
| M-28 | Alt text on all images | 🟡 | Low |
| M-29 | `generateStaticParams` + ISR | 🟡 | Low |
| M-30 | WebSite + SearchAction JSON-LD | 🟡 | Low |
| L-1 | OpenAPI / Swagger docs | 🔵 | Medium |
| L-2 | Test coverage | 🔵 | High |
| L-3 | Redis caching | 🔵 | Medium |
| L-4 | Email notifications | 🔵 | Medium |
| L-5 | Pin Docker image versions | 🔵 | Low |
| L-6 | Audit heading hierarchy | 🔵 | Low |
| L-7 | ItemList JSON-LD | 🔵 | Low |
