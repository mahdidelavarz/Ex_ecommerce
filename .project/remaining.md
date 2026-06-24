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

### ~~C-3 — Checkout Uses Hardcoded Address ID~~ ✅ Fixed
No `temp-address-id` remains. `checkout/page.tsx` has a full address selector: `useAddresses()` fetches the user's saved addresses, radio buttons set `selectedAddressId` (defaulting to the default-shipping address), and a "new address" form (`useCreateAddress`) adds one inline. The place-order button is disabled until an address is selected, and `handlePlaceOrder` sends the real UUID as `shipping_address_id` / `billing_address_id` to `POST /orders` — which matches the backend validator (`order.validator.ts` requires both as UUIDs).

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

### ~~H-7 — All Reviews Auto-Approved on Creation~~ ✅ Fixed
`review.repository.ts:132` — `is_approved: false` on create; `findByProduct()` already filters `.andWhere('review.is_approved = true')` so unapproved reviews never reach customers. `review.controller.ts:33` — success message tells the user "پس از تایید نمایش داده می‌شود". `ReviewsSection.tsx:117-147` — pending state shows "نظر شما در انتظار تایید است" with edit option.

---

### ~~H-8 — No Zod Validators for `approve` / `reply` Endpoints~~ ✅ Fixed
`review.validator.ts:17-23` — `approveReviewSchema` (`is_approved: z.boolean()`) and `replyReviewSchema` (`admin_reply: z.string().min(1).max(1000)`) both defined. `review.routes.ts:30-31` — both wired via `validate({ body: ... })` middleware on `PATCH /:id/approve` and `POST /:id/reply`.

---

### ~~H-9 — `getProductReviews` Hardcodes Pagination Meta~~ ✅ Fixed
`review.controller.ts:11-12` — `page` and `limit` read from `req.query` with `parseInt(...) || default`; both values forwarded into the `ApiResponseHelper.success` meta object so the response reflects actual query params.

---

### ~~H-10 — Helpful Vote Button Has No "Already Voted" State~~ ✅ Fixed
`ReviewCard.tsx:18-27` — `hasVoted` local state initialised from `review.user_has_voted`; `handleHelpful` updates both `hasVoted` and `helpfulCount` from server response. Button applies `text-primary font-medium` when voted and shows `مفید بود ✓` vs `مفید بود؟`; disabled during mutation (`markHelpful.isPending`).

---

### ~~H-11 — Admin Review Actions Use Raw Service Calls~~ ✅ Fixed
`useReviews.ts:68-104` — `useApproveReview`, `useReplyReview`, `useAdminDeleteReview` `useMutation` hooks with `onSuccess` toast + `invalidateQueries` and `onError` typed message. `admin/reviews/page.tsx:34-36` — all three hooks consumed; buttons pass `loading={hook.isPending}` for in-flight state.

---

### ~~H-12 — `/brands/[slug]` Page Missing~~ ✅ Fixed
`frontend/src/app/brands/[slug]/page.tsx` — brand header (logo/initial fallback/description/product count), breadcrumb (خانه → برندها → brand), URL-based sort bar (newest/oldest/price asc-desc/alpha), `ProductGrid`, and windowed pagination. Sort and page state live in URL search params via `updateParams()`, consistent with the category page pattern.

---

### ~~H-13 — `/brands` Listing Page Missing~~ ✅ Fixed
`frontend/src/app/brands/page.tsx` — responsive grid (2→6 columns) of brand cards with logo/initial fallback, product count, and link to `/brands/[slug]`. Paginated via `useBrands({ page, limit: 24, is_active: true })` with prev/next + numbered controls.

---

### ~~H-14 — No `robots.txt`~~ ✅ Fixed
`frontend/src/app/robots.ts` — Next.js `MetadataRoute.Robots` export; allows `/`, disallows `/admin/`, `/checkout/`, `/profile/`, `/orders/`; points `sitemap` at `${NEXT_PUBLIC_SITE_URL}/sitemap.xml`.

---

### ~~H-15 — `generateMetadata` Missing on Category + Brand Pages~~ ✅ Fixed
Both pages split into server shell + client component:
- `categories/[slug]/page.tsx` — server component; fetches `CategoryDetail` (1h revalidate); `generateMetadata` uses `seo.title/description` with fallback to `name/description`; `openGraph` includes category image. Interactive logic extracted to `CategoryPageClient.tsx`.
- `brands/[slug]/page.tsx` — same pattern; `generateMetadata` uses `brand.name/description/logo`; interactive logic extracted to `BrandPageClient.tsx`.

---

### ~~H-16 — `BreadcrumbList` JSON-LD Missing~~ ✅ Fixed
`BreadcrumbList` injected as a `<script type="application/ld+json">` in all three server components:
- `products/[slug]/page.tsx` — Home → Category (if present) → Product; sits alongside the existing `Product` schema.
- `categories/[slug]/page.tsx` — Home → Parent category (if present) → Category; `CategoryPage` converted to `async` to reuse the already-fetched `CategoryDetail`.
- `brands/[slug]/page.tsx` — Home → برندها → Brand; `BrandPage` converted to `async` similarly. Next.js deduplicates the `fetch()` calls shared with `generateMetadata`.

---

### ~~H-17 — `Organization` JSON-LD Missing in Root Layout~~ ✅ Fixed
`frontend/src/app/layout.tsx` — `Organization` schema (`name: 'نازی شاپ'`, `url`, `logo`) injected as the first element inside `<body>`, using `NEXT_PUBLIC_SITE_URL` with `https://yoursite.com` fallback (consistent with `sitemap.ts` and `robots.ts`).

---

### ~~H-18 — Related Products Not Rendered on Product Detail~~ ✅ Fixed
`ProductPageClient.tsx:22` — `useRelatedProducts(slug)` fetches `GET /products/:slug/related`. `ProductPageClient.tsx:288-294` — section renders `<ProductGrid products={relatedProducts} />` when the array is non-empty.

---

### ~~H-19 — Tag Chips on Product Detail Don't Link to Filter URL~~ ✅ Fixed
`ProductPageClient.tsx:246-258` — each tag renders as `<a href={`/products?tag=${tag.slug}`}>`, linking to the filtered product listing.

---

### ~~H-20 — Brand Name on Product Detail Has No Link~~ ✅ Fixed
`ProductPageClient.tsx:117` — brand `<a>` `href` changed from `/products?brand=${product.brand.id}` to `/brands/${product.brand.slug}`, now linking to the brand detail page (unblocked by H-12).

---

## 🟡 Medium

### ~~M-1 — `DB_SSL=false` Default~~ ✅ Fixed
`backend/src/config/env.ts` — `DB_SSL` changed from `z.string().default('false')` to `z.string().optional()`. `env.db.ssl` now resolves to `true` when `NODE_ENV=production` and `DB_SSL` is not set, and to the explicit value otherwise. This makes SSL the safe default in production without requiring ops to remember to set it.

---

### ~~M-2 — File Uploads Not S3-Ready~~ ✅ Fixed
- `env.ts` — five optional S3 vars added (`S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_ENDPOINT`); `env.s3.enabled` is `true` when `S3_BUCKET` is set.
- `backend/src/middleware/upload.ts` — `uploadMiddleware` (multer) uses `multer-s3` + `@aws-sdk/client-s3` when S3 is enabled, falls back to `diskStorage` otherwise. `getFileUrl(file)` returns `file.location` (S3) or `/uploads/${file.filename}` (local). Image-only `fileFilter` and `maxFileSize` enforced in both modes. Upload routes (M-9/M-10) import this middleware.
- `app.ts` — `express.static` serves `./uploads` only when `!env.s3.enabled` (no dead static route in production).

---

### ~~M-3 — OTP Code Exposed in Dev API Response~~ ✅ Fixed
`env.ts` — `EXPOSE_OTP` env var added (`default: 'false'`); `env.exposeOtp` boolean exported. `auth.service.ts:75` — guard changed from `env.nodeEnv === 'development'` to `env.exposeOtp`. OTP is now never leaked unless `EXPOSE_OTP=true` is explicitly set in `.env`, regardless of `NODE_ENV`.

---

### ~~M-4 — Shipping Cost Hardcoded~~ ✅ Fixed
Full settings system added:
- `AppSetting` entity (`app_settings` table, `key` PK + `value` + `label`).
- `backend/src/modules/settings/` — `SettingService` with in-code defaults (`shipping_cost=50000`), upsert, list. `GET /settings/:key` (public), `GET /settings` + `PATCH /settings/:key` (admin). Registered in `app.ts`.
- `order.repository.ts:176` — reads `shipping_cost` from `app_settings` at order creation (falls back to 50000 if row absent).
- `frontend/src/modules/settings/` — `settingService`, `useSetting`, `useAdminSettings`, `useUpdateSetting`.
- `checkout/page.tsx` — `useSetting('shipping_cost')` replaces hardcoded 50000; `effectiveShipping=0` on free_shipping coupon.
- `frontend/src/app/admin/settings/page.tsx` — editable settings list; save button per row enabled only when value is dirty. Linked from admin sidebar.

---

### ~~M-5 — Tax Hardcoded to Zero~~ ✅ Fixed
Tax is now configurable via the `tax_rate` app setting (consistent with `shipping_cost`, and admin-editable — the seed sets it to 9). `order.repository.ts` computes `taxAmount = round((subtotal - discount) * tax_rate / 100)` and includes it in the order total (was hardcoded `taxAmount = 0`). Checkout (`useSetting('tax_rate')`) and the order detail page both show a "مالیات" line. Verified end-to-end: subtotal 98,400,000 → tax 8,856,000 (9%) → total includes it.

**Bonus critical bug fixed:** order placement was completely broken — the stock-lock query combined `.setLock('pessimistic_write')` with `leftJoinAndSelect`, and Postgres rejects `FOR UPDATE` on the nullable side of a LEFT JOIN (`FOR UPDATE cannot be applied to the nullable side of an outer join`). Every `POST /orders` 500'd (the seed inserts orders directly, so it was never exercised). Scoped the lock to the variant table: `.setLock('pessimistic_write', undefined, ['v'])` → `FOR UPDATE OF v`. Order placement verified working.

---

### ~~M-6 — No Order Confirmation Page After Checkout~~ ✅ Fixed
Already implemented (doc was stale). After checkout, `handlePlaceOrder` redirects to the Zarinpal gateway; the backend `payment.service.verify()` redirects back to `${frontendUrl}/orders/{id}?payment=success` (or `?payment=cancelled`). The order detail page (`orders/[id]/page.tsx`) reads the `payment` query param and renders a green success banner ("پرداخت شما با موفقیت انجام شد. سفارش تأیید شد.") or a red cancelled banner with a "پرداخت مجدد" retry button. Uses `?payment=success` rather than the doc's `?confirmed=true`, but fulfils the requirement.

---

### ~~M-7 — Coupon Validation Feedback Missing in Checkout~~ ✅ Fixed
`checkout/page.tsx` — added a persistent `couponError` state. Invalid codes now show an inline red message under the field (with red border) instead of only a transient toast; the success box displays the actual discount amount; the error clears when the code is edited.

---

### ~~M-8 — `bulkStatus()` Not Transactional~~ ✅ Fixed
`product.repository.ts` — `bulkStatus()` now runs inside `AppDataSource.transaction(...)` and verifies `result.affected === ids.length`, throwing `NotFoundError` (rolling back) if any id doesn't match. The batch is now strictly all-or-nothing, including validation that every product exists.

---

### ~~M-9 — Admin Product: No File Upload UI~~ ✅ Fixed
`uploadMiddleware` existed but was never wired to a route. Added backend `modules/uploads/upload.routes.ts` — `POST /api/v1/uploads` (admin, multer single file) returning an **absolute** URL (disk mode stores `/uploads/...` which would break on the frontend origin). Frontend: `productService.uploadImage()` + per-row file `<input>` with thumbnail preview and upload spinner in the product images tab.

---

### ~~M-10 — Variant Images Not Manageable in Admin~~ ✅ Fixed
Backend endpoints + service methods already existed but had no UI. Added a "تصاویر واریانت" section to `admin/products/variants/[variantId]/page.tsx` — gallery of current images with hover-to-delete plus an upload tile (reuses the `/uploads` endpoint then attaches via `variantService.addImage`). Shown in edit mode only, since images need an existing variant id.

---

### ~~M-11 — Product `specification` Field Has No Editor in Admin~~ ✅ Fixed
Backend already accepted `specification: z.record(z.any())` on create/update and returned it in the detail response — only the admin UI was missing. Added a "مشخصات فنی" key/value editor (react-hook-form `useFieldArray` named `specifications`) to the Basic tab of `admin/products/[id]/page.tsx`: add/remove rows of key→value. On load the `specification` object is mapped to `{ key, value }[]`; on submit it's converted back to a record (rows with empty keys dropped, `null` when none) and the UI-only `specifications` field is excluded from the payload.

---

### ~~M-12 — Review `title` / `comment` Allow Empty String~~ ✅ Fixed
`review.validator.ts` already had `.min(1)` (so literal `""` was rejected), but whitespace-only strings like `"   "` slipped through. Changed title/comment in both `createReviewSchema` and `updateReviewSchema` to `z.string().trim().min(1, …)` — now whitespace-only is rejected and stored values are trimmed.

---

### ~~M-13 — Admin Reviews: No Approval Status Filter~~ ✅ Fixed
`admin/reviews/page.tsx:18-30` — `ApprovalFilter` type (`'all' | 'pending' | 'approved'`) with `approvalFilter` state; three tab buttons reset page on change; `queryParams` maps filter to `is_approved` boolean passed to `useAdminReviews`.

---

### ~~M-14 — No Customer UI to Edit an Existing Review~~ ✅ Fixed
The edit infra existed (`ReviewForm` edit mode, `useUpdateReview`) but the trigger UI was incomplete/buggy. `ReviewsSection.tsx` — the "pending approval" box now only renders for genuinely **unapproved** reviews (fixes wrong label + duplication, since `findByProduct` is approved-only). The **main list** now detects the user's own review (`review.user.id === user.id`) and shows an "ویرایش" button that swaps to an inline `ReviewForm` (tracked via `editingReviewId`) — the missing path for editing approved reviews. `ReviewCard.tsx` made author name defensive (`review.user?.full_name ?? 'شما'`) since the `canReview` entity has no `user` relation.

---

### ~~M-15 — `ReviewsSection` Shows Unapproved Reviews~~ ✅ Fixed
Resolved by H-7. `review.repository.ts:21,52` — `findByProduct()` applies `.andWhere('review.is_approved = true')` in both the reviews query and the stats query, so the API never returns unapproved reviews to customers. No client-side filter needed.

---

### ~~M-16 — Admin Panel: Dashboard / Overview Missing~~ ✅ Fixed
New backend `modules/dashboard` — `GET /api/v1/dashboard/stats` (admin) returns revenue (paid orders), order/product/customer counts, pending-order & low-stock counts, status breakdown, and 5 recent orders. New frontend `modules/dashboard` (service/hook/types) + `app/admin/page.tsx` — KPI cards, quick links, and a recent-orders table. Verified end-to-end with a real admin token.

---

### ~~M-17 — Admin Panel: Users Management Missing~~ ✅ Fixed
New backend `modules/users` — admin-only `GET /users` (search by name/phone/email, role + active filters, pagination), `GET /users/:id` (with orders_count), `PATCH /users/:id/role`, `PATCH /users/:id/status`; service guards against an admin demoting/deactivating their own account. New frontend `modules/users` (service/hook/types) + `app/admin/users/page.tsx` — debounced search, role-filter tabs, inline role `<select>`, and a clickable active/inactive status toggle. Verified end-to-end with a real admin token.

---

### ~~M-18 — Admin Panel: Shipments Standalone Page Missing~~ ✅ Fixed
**Backend:** added admin `GET /api/v1/shipments` (status filter, search by tracking/order number, pagination). `shipment.repository.listAll()` joins the order to return `order_number` + `customer_name` alongside each shipment; service caps `limit` at 100; query validated via `shipmentQuerySchema`.
**Frontend:** new `app/admin/shipments/page.tsx` — debounced search, status-filter tabs, table with order link, customer, courier/tracking, and an inline status `<select>` that dispatches via the new `useAdminUpdateShipment` hook (`shipmentService.list` + `useAdminShipments`). Added a "مرسولات" link to the admin sidebar. Verified end-to-end with a real admin token.

---

### ~~M-19 — Magic Numbers Scattered Across Codebase~~ ✅ Fixed (token TTLs)
Added `backend/src/shared/constants/config.constants.ts` exporting `AUTH` with **`ACCESS_TOKEN_TTL: '30m'`** and **`REFRESH_TOKEN_TTL: '30d'`** (plus derived `*_TTL_MS` so the string TTL and ms values can't drift). Wired the token lifetime everywhere it was duplicated:
- `env.ts` — JWT access/refresh expiration defaults now reference `AUTH.*` (and OTP defaults too); `.env` updated `JWT_ACCESS_EXPIRATION=30m`, `JWT_REFRESH_EXPIRATION=30d` (was 45m/120d, which overrode the defaults).
- `shared/utils/cookies.ts` — access/refresh cookie `maxAge` now use `AUTH.ACCESS_TOKEN_TTL_MS` / `AUTH.REFRESH_TOKEN_TTL_MS` (were hardcoded 15m/7d).
- `auth.service.ts` — DB refresh-token `expires_at` uses `AUTH.REFRESH_TOKEN_TTL_MS` (was hardcoded 7d).

Result: JWT signing, both auth cookies, and the DB refresh-token expiry are all consistently 30m / 30d. Rate-limit window constants in `rateLimiter.ts` are still inline (not part of this change).

---

### ~~M-20 — `req.user` Module Augmentation Inconsistent~~ ✅ Fixed
The augmentation already existed and was correct — `shared/types/express.d.ts` declares `Request.user?: User` / `userId?: string` / `requestId?` / `startTime?`, and `tsconfig.json` loads it via both `files` and `typeRoots`. The only code bypassing it was `auth/address.controller.ts`, which read `(req as any).user.id` in `list`/`create`/`delete`. Replaced all three with the typed `req.userId!` (the convention used by every other controller); routes are `authenticate`-guarded so it's always populated. No `(req as any).user` / `req['user']` bypasses remain.

---

### ~~M-21 — No React Error Boundaries~~ ✅ Fixed
Used the App Router's native error-boundary convention (the modern equivalent of a `componentDidCatch` class — Next wraps each segment in a React error boundary via `error.tsx`):
- `app/error.tsx` — catches render errors in any page under the root layout; shows a graceful fallback with **تلاش مجدد** (calls Next's `reset`) and a home link, and logs the error.
- `app/admin/error.tsx` — admin-scoped boundary so a failure stays contained to the panel.
- `app/global-error.tsx` — last-resort boundary for errors thrown in the root layout itself; renders its own `<html>/<body>` with inlined styles (can't rely on providers/CSS).
- Shared presentational `components/ui/ErrorState.tsx` keeps the two in-app boundaries DRY.

No more white-screen crashes. To scope errors to other segments (cart, checkout, …), drop an `error.tsx` re-exporting the same pattern into that folder.

---

### ~~M-22 — React Query Default `staleTime` is Zero~~ ✅ Fixed
`query-provider.tsx` — default `staleTime` raised to **5 minutes** (`retry: 1` and `refetchOnWindowFocus: false` were already set, so focus no longer refetches everything). Real-time data overrides the default per-query: cart was already `30s`; added `staleTime: 30s` to the order hooks (`useMyOrders`, `useOrder`, `useAdminOrders`) so status/payment/fulfillment changes stay fresh, and the dashboard hook already uses `60s`. Mutations still `invalidateQueries`, so post-action correctness is unaffected by the longer default.

---

### ~~M-23 — Cart Quantity Bounds Not Validated~~ ✅ Fixed
`cart.validator.ts` — both `addToCartSchema` and `updateCartItemSchema` now use `z.number().int().min(1).max(100)` with Persian messages, so `quantity: -1` and `quantity: 99999` are rejected with 422 before hitting the DB. Stock validation against `variant.stock_quantity` already existed in `cart.repository.ts` (`addItem` and `updateItem` throw when the requested quantity exceeds stock). Verified: `99999` → "حداکثر تعداد مجاز ۱۰۰ است", `-1` → "حداقل تعداد ۱ است".

---

### ~~M-24 — No Optimistic UI for Cart~~ ✅ Fixed
`useCart.ts` — converted the cart mutations to the `onMutate`/`onError`/`onSettled` optimistic pattern against the `['cart']` query cache (which `CartDrawer`/cart page read via `useCart`):
- **updateItem** (quantity steppers) and **removeItem** — fully optimistic with snapshot rollback on error; a `recalcCart()` helper recomputes `total_items` / `total_quantity` / `subtotal` instantly.
- **addItem** — optimistically increments the quantity when the variant is already in the cart; brand-new line items are reconciled from the authoritative server response in `onSuccess` (they can't be rendered optimistically without variant details, which `AddToCartButton` doesn't carry).
- All three `cancelQueries` first, roll back to the snapshot on error, and `invalidateQueries` on settle. The store stays in sync via the existing query→store `useEffect`.

---

### ~~M-25 — `InventoryLog` Entity Is Dead Code~~ ✅ Fixed
Added a shared `shared/utils/inventory-log.ts` `writeInventoryLog(manager, …)` helper (transaction-safe) and wired it into **every** stock change:
- **order placed / cancelled** — already logged, but refactored to the helper with proper `InventoryLogType` enum members (removed the `'order_placed' as any` casts and an unused `inventoryLogRepo` field).
- **return received** (`return.repository.updateStatus`) — previously did **nothing** to stock. Now, on the `approved → received` transition, it restocks each returned item's variant inside a transaction and writes a `RETURN_RECEIVED` log (referenceId = return id, createdBy = admin). User id threaded controller→service→repo.
- **manual adjustment** (`variant.repository.bulkStock`) — now reads before/after, writes a `STOCK_ADJUSTMENT` log when the quantity changes (skips no-ops); user id threaded controller→service→repo.

**Bonus bug found & fixed:** `PATCH /products/variants/stock` was registered *after* `/:variantId`, so the param route captured `"stock"` and failed UUID parsing — the manual-stock endpoint was effectively broken. Moved the static route before the param routes. Verified end-to-end: manual adjust → `stock_adjustment` log; return received → stock +1 and `return_received` log.

---

### ~~M-26 — Incomplete Return Workflow~~ ✅ Fixed
1. **On `→ received`** — restock + `InventoryLog` (done as part of M-25): `return.repository.updateStatus` increments each returned variant's `stock_quantity` in a transaction and writes a `RETURN_RECEIVED` log.
2. **On `→ refunded`** — added `refund_triggered_at` (timestamptz) to the `Return` entity. In the same transaction, the order's settled `COMPLETED` payment is marked `REFUNDED` (with `refunded_at` + `refund_amount`), the order's `payment_status` → `refunded`, and `refund_triggered_at` is stamped. The gateway refund is attempted best-effort via new `ZarinpalService.refundPayment()` (outside the txn) — failures (sandbox/no PaymentManager access) are logged for manual reconciliation, not thrown, so the workflow always completes.

Verified end-to-end: return → refunded set `refund_triggered_at`; payment → `refunded` + `refunded_at` + amount; order `payment_status` → `refunded`.

**Migration:** `1782345600000-AddRefundTriggeredAt.ts` adds the `returns.refund_triggered_at` column (idempotent `ADD COLUMN IF NOT EXISTS`). Dev gets it automatically via TypeORM `synchronize`; for prod run `npm run migration:run`.

---

### ~~M-27 — `lang="fa" dir="rtl"` Missing on `<html>`~~ ✅ Fixed
`layout.tsx` already renders `<html lang="fa" dir="rtl" …>` (plus `suppressHydrationWarning` for the theme). Verified present — no change needed.

---

### ~~M-28 — Missing `alt` Text on Images~~ ✅ Fixed
Audited all `<Image>`/`<img>` in product/brand/category components. Most already had meaningful alt (`product.title`, `brand.name`, `لوگوی ${brand.name}`, etc.) from the earlier next/image pass. The one violation was the product-detail thumbnail gallery using `alt={img.alt_text || ''}` — changed to `alt={img.alt_text || \`${product.title} - تصویر ${idx + 1}\`}`. Admin-only previews keep their non-empty alts.

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

## 🚀 Production Readiness

### Zarinpal Payment Gateway — currently TEST / sandbox

**Current state (intentional):** the project runs against Zarinpal **sandbox**. A real merchant / payment link has **not** been requested yet, and the config is test-only:
- `ZARINPAL_SANDBOX=true` → all calls hit `https://sandbox.zarinpal.com/pg`.
- `ZARINPAL_MERCHANT_ID=your-merchant-id-here` (placeholder).
- `ZARINPAL_CALLBACK_URL=http://localhost:5000/api/v1/payments/verify` (local HTTP).
- Refunds: `ZarinpalService.refundPayment()` is **best-effort** and currently a logged no-op in sandbox (Zarinpal refunds need merchant PaymentManager/OAuth access we don't have). The return→refunded DB state (payment `refunded`, `refund_triggered_at`, order `payment_status`) is recorded authoritatively regardless, for manual reconciliation.

**Steps to make payments production-ready (do later):**
1. **Get a real merchant id** — register the business at zarinpal.com, complete verification, obtain the production `merchant_id` (UUID).
2. **Set production env** (`backend/.env` / deployment secrets):
   - `ZARINPAL_MERCHANT_ID=<real-uuid>`
   - `ZARINPAL_SANDBOX=false` (switches `ZarinpalService.base` to `https://api.zarinpal.com/pg`)
   - `ZARINPAL_CALLBACK_URL=https://<your-domain>/api/v1/payments/verify` (must be **HTTPS** and publicly reachable)
   - `FRONTEND_URL=https://<your-frontend-domain>` (used for post-verify redirects)
3. **Verify the round-trip on prod** — initiate → gateway → callback `verify` → redirect to `/orders/{id}?payment=success|cancelled`. Confirm `verifyPayment` amount matches the order total (already enforced).
4. **HTTPS + reachability** — Zarinpal must be able to GET the callback URL; ensure TLS and that `/payments/verify` is not behind auth.

**Steps to enable real refunds (do later):**
1. **Request PaymentManager / refund access** from Zarinpal for the merchant (separate approval; not enabled by default).
2. **Obtain an OAuth access token** for the refund API and add `ZARINPAL_ACCESS_TOKEN` to env + `config/env.ts` (`zarinpal.accessToken`).
3. **Update `ZarinpalService.refundPayment()`** — send `Authorization: Bearer ${accessToken}` header to `/v4/payment/refund.json`, pass the correct identifier Zarinpal expects (it may require the **`ref_id`/`sessionId`** of the settled transaction rather than the original `authority` — confirm against current Zarinpal refund docs), and map their response codes (success vs. insufficient-balance vs. already-refunded).
4. **Decide failure policy** — keep it best-effort (current: log + record for manual reconciliation) **or** surface a hard error to the admin when the gateway refund fails. If hard-fail, wrap the gateway call and the DB refund state in one flow so they don't diverge.
5. **Reconciliation report (optional)** — add an admin view of returns where `status='refunded'` but the gateway refund didn't confirm, so finance can process those manually.

Code touch-points: `backend/src/modules/payments/gateway/zarinpal.service.ts`, `payment.service.ts` (initiate/verify), `return.service.ts` + `return.repository.ts` (refund recording), `config/env.ts` (`zarinpal.*`).

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
| ~~C-3~~ | ~~Real address selector in checkout~~ ✅ | 🔴 | Medium |
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
| ~~H-7~~ | ~~Disable review auto-approval~~ ✅ | 🟠 | Low |
| ~~H-8~~ | ~~Zod validators for approve/reply~~ ✅ | 🟠 | Low |
| ~~H-9~~ | ~~Fix review pagination meta~~ ✅ | 🟠 | Low |
| ~~H-10~~ | ~~Helpful vote "already voted" state~~ ✅ | 🟠 | Low |
| ~~H-11~~ | ~~Admin reviews → useMutation hooks~~ ✅ | 🟠 | Low |
| ~~H-12~~ | ~~Create `/brands/[slug]` page~~ ✅ | 🟠 | Medium |
| ~~H-13~~ | ~~Create `/brands` listing page~~ ✅ | 🟠 | Low |
| ~~H-14~~ | ~~`app/robots.ts`~~ ✅ | 🟠 | Low |
| ~~H-15~~ | ~~Metadata on category + brand pages~~ ✅ | 🟠 | Low |
| ~~H-16~~ | ~~BreadcrumbList JSON-LD~~ ✅ | 🟠 | Low |
| ~~H-17~~ | ~~Organization JSON-LD in root layout~~ ✅ | 🟠 | Low |
| ~~H-18~~ | ~~Render related products on detail page~~ ✅ | 🟠 | Low |
| ~~H-19~~ | ~~Tag chips link to filter URL~~ ✅ | 🟠 | Low |
| ~~H-20~~ | ~~Brand name links to brand page~~ ✅ | 🟠 | Low |
| ~~M-1~~ | ~~DB_SSL=true in production~~ ✅ | 🟡 | Low |
| ~~M-2~~ | ~~S3 for uploads (multi-instance)~~ ✅ | 🟡 | High |
| ~~M-3~~ | ~~Remove OTP from dev API response~~ ✅ | 🟡 | Low |
| ~~M-4~~ | ~~Configurable shipping cost~~ ✅ | 🟡 | Low |
| ~~M-5~~ | ~~Tax calculation / config~~ ✅ | 🟡 | Medium |
| ~~M-6~~ | ~~Order confirmation page~~ ✅ | 🟡 | Low |
| ~~M-7~~ | ~~Coupon validation feedback in checkout~~ ✅ | 🟡 | Low |
| ~~M-8~~ | ~~`bulkStatus()` transaction~~ ✅ | 🟡 | Low |
| ~~M-9~~ | ~~Product image file upload in admin~~ ✅ | 🟡 | Medium |
| ~~M-10~~ | ~~Variant image management in admin~~ ✅ | 🟡 | Medium |
| ~~M-11~~ | ~~Specification field editor in admin~~ ✅ | 🟡 | Low |
| ~~M-12~~ | ~~Review title/comment `.min(1)`~~ ✅ | 🟡 | Low |
| ~~M-13~~ | ~~Admin reviews approval filter~~ ✅ | 🟡 | Low |
| ~~M-14~~ | ~~Customer edit-review UI~~ ✅ | 🟡 | Low |
| ~~M-15~~ | ~~Filter unapproved reviews in section~~ ✅ | 🟡 | Low |
| ~~M-16~~ | ~~Admin dashboard page~~ ✅ | 🟡 | Medium |
| ~~M-17~~ | ~~Admin users management page~~ ✅ | 🟡 | High |
| ~~M-18~~ | ~~Admin shipments list page~~ ✅ | 🟡 | Medium |
| ~~M-19~~ | ~~Centralize magic numbers (token TTLs)~~ ✅ | 🟡 | Low |
| ~~M-20~~ | ~~Fix req.user module augmentation~~ ✅ | 🟡 | Low |
| ~~M-21~~ | ~~React error boundaries~~ ✅ | 🟡 | Low |
| ~~M-22~~ | ~~React Query staleTime~~ ✅ | 🟡 | Low |
| ~~M-23~~ | ~~Cart quantity bounds validation~~ ✅ | 🟡 | Low |
| ~~M-24~~ | ~~Optimistic UI for cart~~ ✅ | 🟡 | Medium |
| ~~M-25~~ | ~~Wire InventoryLog~~ ✅ | 🟡 | Medium |
| ~~M-26~~ | ~~Return: stock restore + refund trigger~~ ✅ | 🟡 | High |
| ~~M-27~~ | ~~`lang="fa" dir="rtl"` on `<html>`~~ ✅ | 🟡 | Low |
| ~~M-28~~ | ~~Alt text on all images~~ ✅ | 🟡 | Low |
| M-29 | `generateStaticParams` + ISR | 🟡 | Low |
| M-30 | WebSite + SearchAction JSON-LD | 🟡 | Low |
| L-1 | OpenAPI / Swagger docs | 🔵 | Medium |
| L-2 | Test coverage | 🔵 | High |
| L-3 | Redis caching | 🔵 | Medium |
| L-4 | Email notifications | 🔵 | Medium |
| L-5 | Pin Docker image versions | 🔵 | Low |
| L-6 | Audit heading hierarchy | 🔵 | Low |
| L-7 | ItemList JSON-LD | 🔵 | Low |
