# Dev Map — Road to Production

> Strategy: shared issues first, then module-by-module. Each explored module has its own file under `modules/`.
> Status labels: 🔴 Blocker | 🟠 Bug | 🟡 Incomplete | 🔵 Hardening

---

## Shared / Cross-Cutting Issues

### Infrastructure

| # | Issue | Severity | File |
|---|-------|----------|------|
| I-1 | ~~`docker-compose.yml` healthcheck ran `pg_isready -U postgres` but `POSTGRES_USER` is `node_user` — container startup hangs~~ — ✅ Fixed, changed to `-U node_user` | 🔴 Blocker | `docker-compose.yml:15` |
| I-2 | ~~TypeORM `synchronize: true` must be disabled before production~~ — ✅ Already gated: `synchronize: env.nodeEnv === 'development'` in `database.ts:14`, disabled in production | 🔴 Blocker | `backend/src/config/database.ts` |
| I-3 | No migrations exist yet — production deploy with `synchronize: false` will have no schema; generate initial migration once DB is running with `npm run migration:generate` | 🔴 Blocker | `backend/src/database/migrations/` (empty) |
| I-4 | `DB_SSL=false` default — set `DB_SSL=true` in production `.env` | 🔵 Hardening | `backend/src/config/env.ts` |
| I-5 | File uploads go to `./uploads` — volume-mounted in `docker-compose.yml` so single-instance restarts are safe; for multi-instance deploy, migrate to S3/object storage | 🔵 Hardening | `backend/src/config/env.ts` |

### Security

| # | Issue | Severity | File |
|---|-------|----------|------|
| S-1 | ~~`/auth/make-admin` has no auth or role guard — anyone can promote themselves to admin~~ — ✅ Fixed, route removed | 🔴 Blocker | `auth.routes.ts:29` |
| S-2 | `apiLimiter` defined but never applied to any routes — only auth endpoints have rate limiting | 🟠 Bug | `backend/src/middleware/rateLimiter.ts` |
| S-3 | OTP code returned in API response in `development` mode — safe only if `NODE_ENV` is strictly controlled | 🟡 Incomplete | `auth.service.ts:61` |

### Backend Patterns

| # | Issue | Severity | Notes |
|---|-------|----------|-------|
| P-1 | `returns` module bypasses service layer — routes call repository directly, no Zod validation | 🟠 Bug | `modules/returns/` |
| P-2 | Race condition on order number generation — uses `count() + 1`, concurrent orders can collide | 🟠 Bug | `order.repository.ts` |
| P-3 | Race condition on return number generation — same `count() + 1` pattern | 🟠 Bug | `return.repository.ts:18` |
| P-4 | Inventory stock check not atomic — check then decrement allows overselling under concurrent load | 🟠 Bug | `order.repository.ts` |
| P-5 | Shipping cost hardcoded as `50000` in two places — not configurable | 🟡 Incomplete | `order.repository.ts` + `checkout/page.tsx` |
| P-6 | Tax hardcoded to `0` — no calculation or config | 🟡 Incomplete | `order.repository.ts` |

### Frontend Patterns

| # | Issue | Severity | Notes |
|---|-------|----------|-------|
| F-1 | Checkout sends `addressId: 'temp-address-id'` (hardcoded) — backend rejects with address lookup | 🔴 Blocker | `checkout/page.tsx` |
| F-2 | No order confirmation page/redirect after successful order placement | 🟡 Incomplete | `checkout/page.tsx` |
| F-3 | Coupon field in checkout has no validation feedback | 🟡 Incomplete | `checkout/page.tsx` |
| F-4 | No customer-facing UI to create a return request — backend is fully built | 🟡 Incomplete | missing page in `frontend/src/app/` |

---

## Module Map

| Module | Backend | Frontend | Status | Detail |
|--------|---------|----------|--------|--------|
| auth | ✅ | ✅ | ✅ Fixed | [modules/auth.md](modules/auth.md) |
| categories | ✅ | ✅ | ✅ Fixed | [modules/categories.md](modules/categories.md) |
| brands | ✅ | ✅ | ✅ Fixed | [modules/brands.md](modules/brands.md) |
| products | ✅ | ✅ | ✅ Fixed | [modules/products.md](modules/products.md) |
| attributes | ✅ | ✅ | ✅ Fixed | [modules/attributes.md](modules/attributes.md) |
| variants | ✅ | ✅ | ✅ Fixed | [modules/variants.md](modules/variants.md) |
| tags | ✅ | ✅ | ✅ Fixed | [modules/tags.md](modules/tags.md) |
| cart | ✅ | ✅ | ✅ Fixed | [modules/cart.md](modules/cart.md) |
| coupons | ✅ | ✅ | ✅ Fixed | [modules/coupons.md](modules/coupons.md) |
| orders | ✅ | ✅ | ✅ Fixed | [modules/orders.md](modules/orders.md) |
| payments | ✅ | ✅ | ✅ Fixed | [modules/payments.md](modules/payments.md) |
| shipments | ✅ | ✅ | ✅ Fixed | [modules/shipments.md](modules/shipments.md) |
| reviews | ✅ | ✅ | ✅ Fixed | [modules/reviews.md](modules/reviews.md) |
| wishlist | ✅ | ✅ | ✅ Explored | [modules/wishlist.md](modules/wishlist.md) |
| returns | ⚠️ partial | ✅ admin only | ✅ Explored | [modules/returns.md](modules/returns.md) |

---

## Admin Panel

| Page | Status | Notes |
|------|--------|-------|
| Dashboard / overview | ❌ Missing | No stats page — `/admin` has no landing page |
| Categories | ✅ | |
| Brands | ✅ | |
| Products | ✅ | |
| Attributes | ✅ | |
| Tags | ✅ | |
| Coupons | ✅ | |
| Orders | ✅ | |
| Reviews | ✅ | |
| Returns | ✅ | |
| Users management | ❌ Missing | No UI to view/edit users or change roles |
| Shipments (standalone) | ❌ Missing | Managed inside order detail only |

---

## Production Checklist (final gate)

- [ ] I-1: Fix Docker healthcheck user (`node_user`)
- [ ] I-2/I-3: Disable `synchronize`, generate & run initial migration
- [x] S-1 / AUTH-B1: Remove or guard `/auth/make-admin`
- [x] AUTH-B2: Fix `secure: false` on cookies
- [x] AUTH-B3: Lock JWT `algorithms` to `['HS256']`
- [x] AUTH-F1: Remove `refreshToken` from `localStorage`
- [x] F-1 / O-F1: Real address selection in checkout
- [x] C-F1: Allow guest add-to-cart (remove forced login in `AddToCartButton`)
- [x] PRD-F1: Sanitize `dangerouslySetInnerHTML` (XSS) — isomorphic-dompurify
- [x] PRD-F2/F3: Fix product detail crash + JSX syntax error
- [x] O-B1 / PRD-B1: Fix route ordering (admin/all and slug/related)
- [x] CPN-B1: Validate category restrictions in coupon `validate()`
- [x] PAY-B1–B3 / PAY-F1–F2: Zarinpal gateway integration — initiate + verify endpoints + frontend redirect
- [ ] All remaining module blockers resolved
