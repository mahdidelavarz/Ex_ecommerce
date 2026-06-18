# Module: Orders

## Backend

| # | Issue | Severity | File | Status |
|---|-------|----------|------|--------|
| O-B1 | ~~Admin route `GET /admin/all` defined **after** `/:id` — Express matches `/:id` first, `/admin/all` is **unreachable**~~ — ✅ Fixed, moved before `/:id` | 🔴 Blocker | `order.routes.ts` | ✅ Fixed |
| O-B2 | ~~Coupon applied without checking: usage_limit, per-user limit, min purchase amount, or product/category restrictions~~ — ✅ Fixed, all checks added inside transaction | 🟠 Bug | `order.repository.ts` | ✅ Fixed |
| O-B3 | Coupon `used_count` is computed from `ORDER BY coupon_id` count — no separate column to increment; automatically correct once O-B2 enforces the limit | 🟠 Bug | `order.repository.ts` | ✅ N/A (computed) |
| O-B4 | ~~`findAllAdmin` uses `groupBy` without aggregated columns — fails or returns wrong results in strict SQL mode~~ — ✅ Fixed, removed COUNT aggregation and groupBy | 🟠 Bug | `order.repository.ts` | ✅ Fixed |
| O-B5 | ~~`order_items.variant_title` stores `variant.sku` instead of a human-readable title~~ — ✅ Fixed, now builds `attr1 / attr2` string from variant attribute values | 🟡 Incomplete | `order.repository.ts:93` | ✅ Fixed |
| O-B6 | No payment gateway call after order creation — order created with `payment_status: pending`, no charge happens | 🟡 Incomplete | `order.repository.ts` | ⏳ Pending (requires Zarinpal integration) |

## Frontend

| # | Issue | Severity | File | Status |
|---|-------|----------|------|--------|
| O-F1 | ~~Checkout sends hardcoded `shipping_address_id: 'temp-address-id'` — backend rejects it~~ — ✅ Fixed, uses real selected address | 🔴 Blocker | `checkout/page.tsx` | ✅ Fixed |
| O-F2 | ~~No address selection UI — user cannot pick from their saved addresses~~ — ✅ Fixed, radio list with inline add-new form | 🔴 Blocker | `checkout/page.tsx` | ✅ Fixed |
| O-F3 | ~~No post-order redirect or confirmation page~~ — ✅ Fixed, redirects to `/orders/:id?success=true` with success banner | 🟡 Incomplete | `checkout/page.tsx` | ✅ Fixed |
| O-F4 | Coupon feedback was already wired via `couponService.validate()` | 🟡 Incomplete | `checkout/page.tsx` | ✅ Already done |
| O-F5 | ~~Orders list has no pagination controls~~ — ✅ Fixed, prev/next + page buttons added | 🟡 Incomplete | `orders/page.tsx` | ✅ Fixed |
| O-F6 | ~~Orders list has no status filter~~ — ✅ Fixed, status dropdown added | 🟡 Incomplete | `orders/page.tsx` | ✅ Fixed |
| O-F7 | ~~Cancel confirmation uses `window.confirm()`~~ — ✅ Fixed, inline styled confirm/cancel buttons | 🟡 Incomplete | `orders/[id]/page.tsx` | ✅ Fixed |
| O-F8 | ~~Missing hooks `useAdminOrders` and `useUpdateOrderStatus`~~ — ✅ Fixed, both added to `useOrders.ts` | 🟡 Incomplete | `useOrders.ts` | ✅ Fixed |

## New: Address Module (added to support O-F1/O-F2)

Backend endpoints added to `auth.routes.ts`:
- `GET /api/v1/auth/addresses` — list user's saved addresses
- `POST /api/v1/auth/addresses` — create a new address
- `DELETE /api/v1/auth/addresses/:id` — remove an address

Frontend:
- `frontend/src/modules/auth/services/address.service.ts`
- `frontend/src/modules/auth/hooks/useAddresses.ts` — `useAddresses`, `useCreateAddress`, `useDeleteAddress`

## Remaining / Not Fixed

| # | Reason |
|---|--------|
| O-B6 | Requires Zarinpal payment gateway integration (tracked under PAY-B1–B3) |
