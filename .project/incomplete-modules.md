---
name: incomplete-modules
description: Modules that are missing files relative to the standard pattern — indicates in-progress or skipped work
metadata:
  type: project
---

# Incomplete Modules

These modules deviate from the standard pattern (controller + service + repository + routes + types + validator).

## `returns` — Backend (Significant Gap)

**Status**: Partially implemented. Recently added per git log (`af3f6a7 return api and ui added`).

**What exists**:
- `backend/src/modules/returns/return.routes.ts`
- `backend/src/modules/returns/return.repository.ts`

**What's missing**:
- `return.controller.ts`
- `return.service.ts`
- `return.types.ts`
- `return.validator.ts`

**Issue**: `return.routes.ts` skips the service layer and calls the repository directly. Also does NOT use `ApiResponseHelper` — sends `res.json({ success: true, data })` directly.

**Risk**: No input validation on POST `/returns` or PATCH `/:id/status`. Business logic that should be in a service is absent.

## `shipments` — Backend (Possible Gap)

**What exists**: `shipment.types.ts`, `shipment.service.ts`, `shipment.controller.ts`, `shipment.routes.ts`, `shipment.repository.ts`
**What's missing**: `shipment.validator.ts` (not confirmed — needs verification)

## `payments` — Backend (Possible Gap)

**What exists**: `payment.types.ts`, `payment.validator.ts`, `payment.service.ts`, `payment.controller.ts`, `payment.routes.ts`, `payment.repository.ts`
**Status**: Appears complete. Route mounted at `/payment` (singular) not `/payments`.

## Frontend — `payment` module naming

Frontend module is at `frontend/src/modules/payment/` (singular) while backend is mounted at `/payment`.
Other modules use plural consistently. This is a minor naming inconsistency.

## Frontend — Missing Admin Pages

Based on README features, these admin pages may be missing or incomplete:
- `admin/orders/` — order management (not seen in glob)
- `admin/returns/` — return request processing (not seen in glob)
- `admin/shipments/` — shipment tracking (not seen in glob)

## QUESTIONS
- Is `brand.entity.ts` missing from `database/entities/`? Brands module exists but entity file wasn't found in glob.
- Are admin order/return/shipment pages intentionally omitted or still to be built?
