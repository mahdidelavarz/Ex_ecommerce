# Dev Map — Optimizations, Bugs & Suggestions

_Generated: 2026-06-03_

Items are grouped by priority. Each item includes the affected file(s) and a concrete fix.

---

## CRITICAL — Fix Before Any Production Traffic

### 1. Committed Secrets in Git History
**Files:** `backend/.env`
**Problem:** JWT secret, PostgreSQL password (`123`), and Kavenegar API key are committed to the
repository. Anyone with git access can extract them from history even after the file is removed.
**Fix:**
1. Immediately rotate all secrets (new JWT secret, new DB password, new API key).
2. Remove `.env` from git history: `git filter-repo --path backend/.env --invert-paths`
3. Add `backend/.env` to `backend/.gitignore` (already listed — verify it was not force-added).
4. Provide `backend/.env.example` with placeholder values.

---

### 2. No Database Transactions for Order Creation
**Files:** `backend/src/modules/orders/order.service.ts`
**Problem:** Creating an order touches multiple tables (order, order_items, coupon uses_count).
If any step fails mid-way, the database is left in a corrupt state.
**Fix:**
```typescript
await AppDataSource.transaction(async (manager) => {
  const order = manager.create(Order, { ... });
  await manager.save(order);
  await manager.save(orderItems);
  if (coupon) {
    await manager.increment(Coupon, { id: coupon.id }, 'uses_count', 1);
  }
});
```
Apply the same pattern to coupon creation, return processing, and payment recording.

---

### 3. Missing Stock Management
**Files:** `backend/src/database/entities/product-variant.entity.ts`,
`backend/src/modules/cart/cart.service.ts`,
`backend/src/modules/orders/order.service.ts`
**Problem:** `ProductVariant` has no `quantity_available` column. `InventoryLog` entity exists
but is never used. Cart accepts any quantity without checking stock. Orders can be placed for
out-of-stock items.
**Fix:**
1. Add `quantity_available: number` column to `ProductVariant`.
2. In cart service, validate `requestedQty <= variant.quantity_available`.
3. In order service (inside a transaction), decrement `quantity_available` on each variant.
4. Write to `InventoryLog` on every stock change.

---

### 4. No CSRF Protection
**Files:** `backend/src/app.ts`
**Problem:** State-changing endpoints (POST, PATCH, DELETE) have no CSRF token validation.
Cross-site request forgery attacks are possible.
**Fix:** Install `csurf` (or `csrf` + custom middleware) and attach CSRF cookie alongside the
access token cookie. Alternatively, since the API is consumed by a single-origin frontend,
validate the `Origin` / `Referer` header in middleware as a simpler guard.

---

### 5. Refresh Token in localStorage
**Files:** `frontend/src/modules/auth/store/auth.store.ts`,
`frontend/src/lib/api-client.ts`
**Problem:** The refresh token is persisted in `localStorage`, which is accessible to any
JavaScript on the page (XSS attack surface). Access token is correctly in an httpOnly cookie.
**Fix:** Issue the refresh token as a second httpOnly `Secure SameSite=Strict` cookie from the
backend. Remove the `refreshToken` field from Zustand state and localStorage. The
`/auth/refresh` endpoint will read the cookie automatically — no body change needed in the
interceptor.

---

## HIGH — Fix Before Feature-Complete Release

### 6. Returns & Payments Routes Missing Validation and asyncHandler
**Files:** `backend/src/modules/returns/return.routes.ts`,
`backend/src/modules/payments/payment.routes.ts`
**Problem:** Route handlers are raw `async (req, res) => {}` functions without `asyncHandler`
wrapping. Unhandled promise rejections will crash the process (or produce an unhandled rejection
warning). Input is read from `req.body` without Zod validation.
**Fix:**
```typescript
// return.routes.ts
import { asyncHandler } from '../../middleware/asyncHandler';
import { validate } from '../../middleware/validate';
import { createReturnSchema } from './return.validator';

router.post('/', authenticate, validate(createReturnSchema), asyncHandler(createReturn));
```
Write Zod schemas for all missing endpoints.

---

### 7. OTP Brute Force — No IP-Level Lockout
**Files:** `backend/src/modules/auth/auth.service.ts`,
`backend/src/middleware/rateLimiter.ts`
**Problem:** OTP has a 3-attempt-per-code limit but there is no IP-level rate limit on the
`/auth/send-otp` and `/auth/verify-otp` endpoints. An attacker can request a new OTP
immediately after failing 3 times.
**Fix:**
```typescript
// rateLimiter.ts — add a dedicated auth limiter
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 10,                    // 10 OTP requests per IP per window
  message: 'Too many auth attempts',
});
```
Apply `authLimiter` before the OTP routes in `auth.routes.ts`.

---

### 8. TypeORM `synchronize: true` Must Be Off in Production
**Files:** `backend/src/database/data-source.ts` (or `config/database.ts`)
**Problem:** `synchronize: true` auto-alters the database schema on every server start.
In production this can drop columns, alter types, or cause data loss.
**Fix:**
```typescript
synchronize: process.env.NODE_ENV === 'development',
migrationsRun: process.env.NODE_ENV === 'production',
```
Generate and commit TypeORM migrations for all schema changes before deploying.

---

### 9. Admin Pages Have No Server-Side or Client-Side Role Guard
**Files:** `frontend/src/app/admin/` (all pages)
**Problem:** Any logged-in user who navigates to `/admin/*` can access the admin interface.
The backend has role-based middleware but the frontend does not enforce it.
**Fix:** Create an `AdminGuard` component:
```tsx
function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  const router = useRouter();
  useEffect(() => {
    if (user && user.role !== 'admin') router.replace('/');
  }, [user]);
  if (!user || user.role !== 'admin') return null;
  return <>{children}</>;
}
```
Wrap every `app/admin/*/page.tsx` layout with `AdminGuard`.

---

### 10. N+1 Queries in Product Listing
**Files:** `backend/src/modules/products/product.repository.ts`
**Problem:** Each product in the listing loads its full `category` and `brand` relations.
For a 50-product page this is 100 extra queries.
**Fix:** Use `select` to load only the required fields, or load category/brand in a single
JOIN rather than lazy-loading:
```typescript
qb.leftJoin('product.category', 'category')
  .addSelect(['category.id', 'category.name', 'category.slug'])
  .leftJoin('product.brand', 'brand')
  .addSelect(['brand.id', 'brand.name']);
```

---

### 11. next/image Remote Pattern Too Permissive
**Files:** `frontend/next.config.ts`
**Problem:** `remotePatterns` allows any hostname (`**`). This lets the `<Image>` component
proxy and serve arbitrary external images, which can be abused for SSRF or image-jacking.
**Fix:** Restrict to the actual image CDN/storage host:
```typescript
remotePatterns: [
  { protocol: 'https', hostname: 'your-storage-bucket.s3.amazonaws.com' },
],
```

---

### 12. Coupon Can Be Applied Multiple Times
**Files:** `backend/src/modules/coupons/coupon.service.ts`,
`backend/src/modules/orders/order.service.ts`
**Problem:** A user can place multiple orders with the same coupon code, each time
incrementing `uses_count` only by 1. If `max_uses_per_user` is not enforced, one user can
use a coupon unlimited times.
**Fix:** Add a `coupon_usages` join table tracking (coupon_id, user_id) count.
Before applying, check `SELECT COUNT(*) WHERE coupon_id = ? AND user_id = ?` against
`coupon.max_uses_per_user`.

---

## MEDIUM — Code Quality & Maintainability

### 13. Magic Numbers Scattered Across the Codebase
**Files:** `backend/src/modules/auth/auth.service.ts`,
`backend/src/middleware/rateLimiter.ts`
**Problem:** OTP expiry (`2` minutes, `10` minutes), token TTLs (`"45m"`, `"120d"`),
rate limit window (`900000`ms) are hardcoded inline.
**Fix:** Centralize in `backend/src/shared/constants/config.constants.ts`:
```typescript
export const AUTH = {
  OTP_EXPIRY_MS: 10 * 60 * 1000,
  OTP_MAX_ATTEMPTS: 3,
  ACCESS_TOKEN_TTL: '45m',
  REFRESH_TOKEN_TTL: '120d',
};
```

---

### 14. Module Augmentation for `req.user` Is Inconsistent
**Files:** `backend/src/middleware/auth.ts`, various controllers
**Problem:** `req.user` is typed via a local interface declaration rather than proper Express
module augmentation. Some controllers cast with `as unknown as AuthenticatedUser`, bypassing
type safety.
**Fix:** In `backend/src/types/express.d.ts`:
```typescript
import { UserPayload } from '../modules/auth/auth.types';
declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
      requestId?: string;
    }
  }
}
```
Remove all `as unknown as` casts from controllers.

---

### 15. No React Error Boundaries
**Files:** `frontend/src/app/layout.tsx`
**Problem:** A runtime error in any page component will crash the entire app with a white
screen. There are no error boundary components.
**Fix:** Create `frontend/src/components/ErrorBoundary.tsx` (class component with
`componentDidCatch`) and add it to `layout.tsx`. Also add a Next.js `error.tsx` alongside
each major route segment.

---

### 16. React Query Default staleTime is Zero
**Files:** `frontend/src/lib/query-provider.tsx`
**Problem:** With `staleTime: 0` (default), React Query refetches every query whenever the
window regains focus. Category lists, brand lists, and product filters are fetched repeatedly
and rarely change.
**Fix:**
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,  // 5 minutes global default
      retry: 1,
    },
  },
});
```
Override per-query for data that needs to be fresh (cart, orders).

---

### 17. Cart Does Not Validate Quantity Bounds
**Files:** `backend/src/modules/cart/cart.service.ts`,
`backend/src/modules/cart/cart.validator.ts`
**Problem:** A user can add `quantity: -1` or `quantity: 99999` to the cart.
**Fix:** In the Zod schema, enforce `z.number().int().min(1).max(100)` for quantity.
After stock management is added (item 3), also validate against available stock.

---

### 18. No Optimistic UI for Cart and Wishlist
**Files:** `frontend/src/modules/cart/hooks/`,
`frontend/src/modules/wishlist/hooks/`
**Problem:** Adding to cart or wishlist waits for a full server round-trip before the UI
updates. This feels slow and increases perceived latency.
**Fix:** Use React Query's `onMutate` for optimistic updates:
```typescript
onMutate: async (newItem) => {
  await queryClient.cancelQueries({ queryKey: ['cart'] });
  const prev = queryClient.getQueryData(['cart']);
  queryClient.setQueryData(['cart'], (old) => addItemOptimistically(old, newItem));
  return { prev };
},
onError: (err, newItem, context) => {
  queryClient.setQueryData(['cart'], context.prev);
},
```

---

### 19. `InventoryLog` Entity Is Dead Code
**Files:** `backend/src/database/entities/inventory-log.entity.ts`
**Problem:** The entity is defined and registered with TypeORM but never written to.
**Fix:** Either wire it into the stock-management flow (item 3 above) or delete it to
avoid confusion. Do not leave unused entities in the schema.

---

### 20. Incomplete Return Workflow — No Inventory Restore or Refund
**Files:** `backend/src/modules/returns/return.service.ts`
**Problem:** Return status can be set to `APPROVED` but the system does not:
- Restore stock on the returned variant
- Trigger a payment refund
- Generate a return shipping label
**Fix (minimal):**
1. When return status → APPROVED: increment `variant.quantity_available` inside a transaction.
2. Add a `refund_triggered_at` column on `Return`; set it when the payment gateway is called.
3. Document the shipping label step as a manual operation until a carrier API is integrated.

---

## LOW — Nice to Have

### 21. Add OpenAPI / Swagger Documentation
**Files:** `backend/src/app.ts`
**Suggestion:** Use `swagger-jsdoc` + `swagger-ui-express` or `tsoa` to auto-generate API
documentation from TypeScript decorators or JSDoc. This removes the need for a separate
Postman collection and lets frontend developers self-serve.

---

### 22. Add Test Coverage
**Problem:** Zero tests found in the entire project. No unit tests, no integration tests,
no e2e tests.
**Suggested stack:**
- Backend: `vitest` + `supertest` + `testcontainers` (real PostgreSQL in Docker)
- Frontend: `vitest` + `@testing-library/react`
- E2E: `Playwright`
**Start with:** auth flow, order creation, and coupon validation — the highest-risk paths.

---

### 23. Add Redis Caching for Frequently Read, Rarely Changed Data
**Files:** `backend/src/modules/categories/category.service.ts`,
`backend/src/modules/brands/brand.service.ts`
**Suggestion:** Category and brand lists change infrequently but are requested on every
product page. Cache them in Redis with a 10-minute TTL:
```typescript
const cached = await redis.get('categories:all');
if (cached) return JSON.parse(cached);
const result = await this.repo.findAll();
await redis.setex('categories:all', 600, JSON.stringify(result));
return result;
```

---

### 24. Add Email Notifications via a Transactional Email Provider
**Missing:** Order confirmation, shipment update, return status, OTP fallback
**Suggestion:** Use Resend or Nodemailer + SMTP. Create an `email.service.ts` in `shared/utils/`
and call it after key state transitions (order placed, shipment dispatched, return approved).

---

### 25. Lock Down Docker Image Versions
**Files:** `backend/Dockerfile`, `frontend/Dockerfile`, `docker-compose.yml`
**Problem:** If base images use `:latest` tags, the build is non-reproducible and a
dependency update can silently break production.
**Fix:** Pin to exact versions: `node:20.15.1-alpine`, `postgres:16.3-alpine`.

---

## Summary Checklist

| # | Item                                  | Priority  | Effort |
|---|---------------------------------------|-----------|--------|
| 1 | Rotate and remove committed secrets   | Critical  | Low    |
| 2 | Transactions on order creation        | Critical  | Medium |
| 3 | Add stock management to variants      | Critical  | High   |
| 4 | CSRF protection                       | Critical  | Low    |
| 5 | Move refresh token to httpOnly cookie | Critical  | Medium |
| 6 | asyncHandler + validation on returns  | High      | Low    |
| 7 | Auth rate limiter per IP              | High      | Low    |
| 8 | Disable synchronize in production     | High      | Low    |
| 9 | Admin role guard on frontend          | High      | Low    |
|10 | Fix N+1 in product listing            | High      | Medium |
|11 | Restrict next/image remote patterns   | High      | Low    |
|12 | Per-user coupon usage limit           | High      | Medium |
|13 | Centralize magic numbers              | Medium    | Low    |
|14 | Fix req.user module augmentation      | Medium    | Low    |
|15 | Add React error boundaries            | Medium    | Low    |
|16 | Set React Query staleTime             | Medium    | Low    |
|17 | Cart quantity bounds validation       | Medium    | Low    |
|18 | Optimistic UI for cart/wishlist       | Medium    | Medium |
|19 | Wire or delete InventoryLog           | Medium    | Low    |
|20 | Complete return workflow              | Medium    | High   |
|21 | OpenAPI docs                          | Low       | Medium |
|22 | Test coverage                         | Low       | High   |
|23 | Redis caching                         | Low       | Medium |
|24 | Email notifications                   | Low       | Medium |
|25 | Pin Docker image versions             | Low       | Low    |
