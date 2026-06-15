# Project Evaluation — Nazi Shop (E-Commerce Platform)

_Evaluated: 2026-06-03 | Model: claude-sonnet-4-6_

---

## Overview

A full-stack e-commerce platform with a Node.js/Express/TypeORM backend and a Next.js 15 frontend.
The project supports a Persian (Farsi) market with OTP-based authentication via SMS (Kavenegar),
an admin dashboard, RTL layout, Jalali date support, and Docker-based deployment.

---

## Tech Stack

| Layer      | Technology                                          |
|------------|-----------------------------------------------------|
| Backend    | Node.js · Express 4 · TypeScript 5 · TypeORM 0.3   |
| Database   | PostgreSQL 16                                       |
| Frontend   | Next.js 15 (App Router) · TypeScript 5              |
| Styling    | Tailwind CSS v4                                     |
| State      | Zustand (client) + TanStack Query (server)          |
| Auth       | OTP → JWT (access + refresh rotation)               |
| DevOps     | Docker · Docker Compose                             |

---

## Architecture Assessment

### Backend

The backend follows a clean, feature-based modular structure:

```
modules/[feature]/
    controller  →  service  →  repository  →  entity
```

This is a textbook layered approach: controllers handle HTTP, services hold business logic,
repositories abstract database queries. The separation is consistently applied across all 15+
modules (auth, products, categories, variants, cart, coupons, orders, payments, shipments,
reviews, wishlist, returns, etc.).

**Strengths:**
- Consistent module structure across all 15+ features
- Custom error class hierarchy (AppError → BadRequest/Unauthorized/NotFound/etc.)
- Centralized async error handling via `asyncHandler` wrapper
- Standardized API response format via `ApiResponseHelper`
- Order snapshot pattern: prices and addresses captured at purchase time (protects order history)
- JWT access token in httpOnly cookie (XSS-resistant)
- Rate limiting middleware present
- Winston structured logging with request context (requestId, method, path, user)
- Helmet + CORS configured

**Weaknesses:**
- No database transaction support for multi-step operations (order creation, coupon use)
- Returns and payment routes missing Zod validation and asyncHandler wrapping
- `synchronize: true` in TypeORM config will be dangerous if left on in production
- No API versioning strategy beyond the `/api/v1` prefix
- OTP brute-force protection (3 attempt limit) not backed by IP-level rate limiting

---

### Frontend

Feature-based modular structure mirroring the backend:

```
modules/[feature]/
    components · hooks · services · store · types
```

**Strengths:**
- Axios interceptor auto-refreshes expired access tokens and retries the original request
- Zustand stores for auth and cart with localStorage persistence
- React Query for all server-state fetching (caching, revalidation, loading states)
- Full RTL and Persian locale support
- Dark/light theme via next-themes
- Admin CRUD pages for products, categories, orders, brands, attributes, tags

**Weaknesses:**
- Refresh token stored in localStorage — vulnerable to XSS if any third-party script runs
- No React error boundaries; network failures can crash entire page sections
- Admin pages do not verify `user.role === 'admin'` on the client side
- No optimistic UI updates — cart and wishlist operations feel slow waiting for server round-trip
- `next/image` configured to allow any remote source (`**`) — should be locked to known domains

---

### Database Design

30+ TypeORM entities with proper relationships, compound indexes, and UUID primary keys.

**Strengths:**
- Proper foreign key constraints with appropriate CASCADE/RESTRICT behavior
- Indexes on high-cardinality filter columns (slug, phone_number, category_id, brand_id)
- JSONB for flexible data (product specifications, address snapshots, SEO fields)
- Audit entities present (LoginLog, InventoryLog, RefreshToken)

**Weaknesses:**
- `InventoryLog` entity exists but is never written to — dead code
- `ProductVariant` has no `quantity_available` column, so stock cannot be tracked
- No composite indexes on (`product_id`, `is_active`) for common filter patterns
- `CouponProduct` and `CouponCategory` junction tables lack indexes on their FK columns

---

## Feature Completeness

| Feature                     | Status        | Notes                                          |
|-----------------------------|---------------|------------------------------------------------|
| OTP Authentication          | Complete      | Production-ready                               |
| Product CRUD                | Complete      | Full admin interface                           |
| Variants / Attributes       | Complete      | M2M attribute assignment works                 |
| Cart (guest + user)         | Complete      | Session merge on login implemented             |
| Coupons                     | Complete      | Percentage / fixed / free-shipping types       |
| Orders                      | Partial       | Creation works; payment processing is a stub  |
| Payments                    | Stub only     | Records saved but no gateway integration       |
| Shipments                   | Partial       | Status tracking exists; no carrier API        |
| Returns                     | Partial       | Status field only; no refund or stock restore |
| Reviews                     | Complete      | Moderation and helpful votes implemented       |
| Wishlist                    | Complete      |                                                |
| Stock Management            | Missing       | No quantity column on variants                 |
| Email Notifications         | Missing       | No mailer integrated                           |
| Analytics / Reporting       | Missing       | No dashboard metrics                           |

---

## Security Assessment

| Area                        | Rating  | Finding                                                    |
|-----------------------------|---------|------------------------------------------------------------|
| Secrets in repository       | FAIL    | `.env` with real credentials committed to git              |
| JWT storage                 | WARN    | Access token in httpOnly cookie (good); refresh in localStorage (bad) |
| CSRF protection             | FAIL    | No CSRF tokens on state-changing endpoints                 |
| OTP brute force             | WARN    | 3-attempt limit but no IP-level lockout                    |
| Input validation            | WARN    | Zod used in most routes; returns and payments uncovered    |
| Input sanitization          | WARN    | JSONB fields not sanitized before storage                  |
| CORS                        | OK      | Configured with allowed origins                            |
| Helmet                      | OK      | Applied globally                                           |
| Rate limiting               | WARN    | Global limiter present; auth endpoints need dedicated limiter |

---

## Performance Assessment

| Area                        | Rating  | Finding                                                    |
|-----------------------------|---------|------------------------------------------------------------|
| N+1 queries                 | WARN    | Product listing eager-loads full category/brand objects    |
| Unbounded relationships     | WARN    | `order.items`, `product.variants` loaded without limits   |
| No query caching            | WARN    | Category list and brand list fetched fresh on every request|
| Missing indexes             | WARN    | Variant attribute join table, coupon scope tables          |
| Frontend: no staleTime      | WARN    | React Query refetches on every window focus by default     |

---

## Code Quality Score

| Dimension              | Score (1–10) | Comment                                             |
|------------------------|--------------|-----------------------------------------------------|
| Architecture           | 8            | Clean feature modules, good separation of concerns  |
| Type Safety            | 7            | Good overall; some `as unknown as T` casts          |
| Error Handling         | 7            | Good hierarchy; missing in returns/payment routes   |
| Test Coverage          | 1            | No tests found anywhere in the project              |
| Security               | 4            | Committed secrets, no CSRF, localStorage token      |
| Documentation          | 5            | README present; no API docs (OpenAPI/Swagger)       |
| Feature Completeness   | 6            | Core flow works; payments and stock incomplete      |
| **Overall**            | **6 / 10**   |                                                     |

---

## Summary

This is a well-architected, feature-rich e-commerce platform. The modular structure is
genuinely good and scales cleanly. The main blockers before production are:

1. **Rotate all secrets** — credentials are committed to git right now
2. **Complete payment gateway** — the entire checkout funnel ends in a stub
3. **Add stock management** — there is no inventory column on variants
4. **Write tests** — zero test coverage is the biggest long-term risk
5. **Move refresh token out of localStorage** — replace with httpOnly Secure cookie
