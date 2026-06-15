---
name: backend-patterns
description: Backend module structure, service-repository pattern, middleware, response helpers, and auth pattern
metadata:
  type: project
---

# Backend Patterns

## Standard Module Structure

Every backend module lives in `backend/src/modules/<name>/` and should contain:

```
module.controller.ts   — Express handlers, calls service, returns ApiResponseHelper
module.service.ts      — Business logic, validation, orchestration
module.repository.ts   — TypeORM queries, direct DB access
module.routes.ts       — Express Router, wires middleware + controller
module.types.ts        — TypeScript interfaces/types for this module
module.validator.ts    — Zod schemas for request validation
```

**OBSERVATION**: Not all modules follow this fully (see [[incomplete-modules]]).

## Response Pattern

Use `ApiResponseHelper` from `backend/src/shared/utils/response.ts`:

```ts
ApiResponseHelper.success(res, data, 'message')
ApiResponseHelper.created(res, data)
ApiResponseHelper.paginated(res, data, total, page, limit)
ApiResponseHelper.error(res, 'message', 404)
ApiResponseHelper.noContent(res)
```

**IMPORTANT**: The `returns` module bypasses this and sends `res.json({ success: true, data })` directly — inconsistent.

## Middleware Stack (app.ts)

Order matters:
1. `helmet()` — security headers
2. `corsConfig` — CORS from `config/cors.ts`
3. `express.json()` + `express.urlencoded()` (10mb limit)
4. `cookieParser()` — required for JWT cookie reading
5. `morgan('dev')` — dev only
6. `requestLogger` — custom logger
7. `generalLimiter` — rate limiting

## Auth Middleware

`backend/src/middleware/auth.ts`:
- `authenticate` — validates JWT from `Authorization: Bearer <token>` header OR `accessToken` cookie, sets `req.userId` and `req.userRole`
- `authorize(...roles)` — checks `req.userRole` against allowed roles

```ts
router.get('/admin', authenticate, authorize(UserRole.ADMIN), controller.method);
```

## Validation Middleware

`backend/src/middleware/validate.ts` — wraps Zod schemas:
```ts
router.post('/', validate(myZodSchema), controller.create);
```

## Database

- Config: `backend/src/config/database.ts` — TypeORM DataSource
- Entities: `backend/src/database/entities/` (30+ files)
- Base entity: `backend/src/database/base.entity.ts` — adds `id`, `createdAt`, `updatedAt` to all entities
- Dev mode: `synchronize: true` (auto-creates tables — migrations not used in dev)
- Prod mode: use `npm run migration:run`

## Error Handling

- Custom error classes in `backend/src/shared/utils/errors.ts`
- Global handler in `backend/src/middleware/errorHandler.ts`
- Async route safety via `backend/src/middleware/asyncHandler.ts`

## Enums (shared/constants/enums.ts)

Key enums used across modules:
- `UserRole`: customer, admin, support
- `OrderStatus`: pending → confirmed → processing → shipped → delivered → cancelled → returned
- `PaymentStatus`: pending, partially_paid, paid, refunded, failed
- `ShipmentStatus`: pending → processing → shipped → in_transit → out_for_delivery → delivered → failed → returned
- `ReturnStatus`: pending, approved, rejected, received, refunded
- `CouponType`: percentage, fixed, free_shipping
- `InventoryLogType`: order_placed, order_cancelled, return_received, stock_adjustment, stock_import, damage_loss

## Variant Routes — Special Case

Variants are mounted at root prefix (not `/variants`):
```ts
app.use(`${apiPrefix}`, variantRoutes);  // NOT /variants
```
This means variant routes are like `/api/v1/products/:id/variants`.
