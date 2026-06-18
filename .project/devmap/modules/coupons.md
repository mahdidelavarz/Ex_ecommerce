# Module: Coupons

## Backend

| # | Issue | Severity | File | Status |
|---|-------|----------|------|--------|
| CPN-B1 | ~~`validate()` loaded `coupon_categories` but never checked them~~ — ✅ Fixed: added category check by querying products by `product_ids` and matching `category_id` against `coupon_categories` | 🔴 Blocker | `coupon.repository.ts` | ✅ Fixed |
| CPN-B2 | ~~Percentage ≤ 100 validated on create only — `updateCouponSchema.partial()` dropped the refine~~ — ✅ Fixed: added `.refine()` to `updateCouponSchema` | 🟠 Bug | `coupon.validator.ts` | ✅ Fixed |
| CPN-B3 | `free_shipping` discount hardcoded to `0` — not connected to real shipping cost | 🟡 Incomplete | `coupon.repository.ts` | ⏭ Deferred (shipping cost is also hardcoded globally) |
| CPN-B4 | `used_count` never incremented — ✅ Not a bug: `findAll` derives `used_count` dynamically via JOIN on orders; `validate()` uses `orderRepo.count()` — always accurate | 🟠 Bug | `order.repository.ts` | ✅ Already correct |

## Frontend

| # | Issue | Severity | File | Status |
|---|-------|----------|------|--------|
| CPN-F1 | ~~Admin coupon form had `product_ids`/`category_ids` in schema but no UI fields~~ — ✅ Fixed: added scrollable checkbox lists for product and category restrictions | 🔴 Blocker | `admin/coupons/[id]/page.tsx` | ✅ Fixed |
| CPN-F2 | ~~`useProducts?.()` optional-chained call was a syntax error~~ — ✅ Fixed: changed to `useProducts({ limit: 200 })` | 🟠 Bug | `admin/coupons/[id]/page.tsx` | ✅ Fixed |
| CPN-F3 | ~~Admin coupon list omitted `min_order_amount`, `max_discount`, `usage_per_user` columns~~ — ✅ Fixed: three new responsive columns added | 🟡 Incomplete | `admin/coupons/page.tsx` | ✅ Fixed |
| CPN-F4 | ~~No mutation hooks — form called API directly with untyped `any`~~ — ✅ Fixed: added `useCreateCoupon`, `useUpdateCoupon`, `useDeleteCoupon` in `useCoupons.ts`; wired into form and list | 🟡 Incomplete | `useCoupons.ts` | ✅ Fixed |
| CPN-F5 | ~~Checkout coupon field never called `POST /coupons/validate`~~ — ✅ Fixed: added `applyCoupon` with validate call, discount display in summary, applied code passed to `createOrder` | 🟡 Incomplete | `checkout/page.tsx` | ✅ Fixed |

## Feature Coverage

| Feature | DB | Backend | Admin Form | Admin List |
|---------|-----|---------|------------|------------|
| Code / Type / Value | ✅ | ✅ | ✅ | ✅ |
| min_order_amount | ✅ | ✅ | ✅ | ✅ |
| max_discount (cap) | ✅ | ✅ | ✅ (% only) | ✅ |
| usage_limit | ✅ | ✅ | ✅ | ✅ |
| usage_per_user | ✅ | ✅ | ✅ | ✅ |
| Date range | ✅ | ✅ | ✅ | ✅ |
| Product restrictions | ✅ | ✅ | ✅ | ❌ (display only) |
| Category restrictions | ✅ | ✅ | ✅ | ❌ (display only) |
| used_count tracking | ✅ | ✅ (via JOIN) | — | ✅ |
