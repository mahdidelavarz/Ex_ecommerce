---
name: frontend-route-auth
description: Frontend page visibility matrix and auth guard source of truth
metadata:
  type: project
---

# Frontend Route Auth

Source of truth:
- `frontend/src/lib/public-routes.ts`
- `frontend/src/modules/auth/components/AuthRouteGuard.tsx`
- `frontend/src/app/admin/AdminGuard.tsx`

The root app guard is public-by-default and blocks only explicit protected
prefixes. This keeps storefront, content, search, and 404 pages visible without
login while preserving login redirects for customer/account/admin sections.

## Protected Prefixes

These route prefixes require login:

| Prefix | Access |
|---|---|
| `/admin` | admin only |
| `/checkout` | authenticated customer |
| `/orders` | authenticated customer |
| `/profile` | authenticated customer |
| `/returns` | authenticated customer |
| `/wishlist` | authenticated customer |

Add any new private customer route to `PROTECTED_ROUTE_PREFIXES`, or protect it
with a segment layout/hook before adding links to it.

## Public Pages

These pages should appear without login:

| Route | Notes |
|---|---|
| `/` | homepage |
| `/login` | OTP login; redirects authenticated users away |
| `/cart` | guest cart uses session id; no login required |
| `/products` | public product listing |
| `/products/[slug]` | public product detail |
| `/categories/[slug]` | public category detail |
| `/brands` | public brand listing |
| `/brands/[slug]` | public brand detail |
| `/blog` | public blog listing |
| `/blog/[slug]` | public blog detail |
| `/search` | public search |
| `/about` | public content |
| `/contact` | public content |
| `/faq` | public content |
| `/shipping` | public content |
| `/returns-policy` | public content |
| `/terms` | public content |
| `/privacy` | public content |

## Customer Login Pages

These pages are authenticated customer pages:

| Route | Notes |
|---|---|
| `/profile` | profile and profile completion |
| `/profile/orders` | duplicate account order list |
| `/profile/addresses` | address management |
| `/profile/sessions` | active sessions |
| `/orders` | order list |
| `/orders/[id]` | order detail and payment return state |
| `/checkout` | order placement |
| `/wishlist` | saved variants |
| `/returns` | return request/history |
| `/returns/[id]` | return detail |

## Admin Pages

All routes under `/admin` require an authenticated `admin` user. The segment
layout wraps children with `AdminGuard`; several admin pages also call
`useAdminRoute()` locally.

Current admin pages:

| Route |
|---|
| `/admin` |
| `/admin/attributes` |
| `/admin/attributes/[id]` |
| `/admin/blog` |
| `/admin/blog/[id]` |
| `/admin/brands` |
| `/admin/brands/[id]` |
| `/admin/categories` |
| `/admin/categories/[id]` |
| `/admin/coupons` |
| `/admin/coupons/[id]` |
| `/admin/orders` |
| `/admin/orders/[id]` |
| `/admin/products` |
| `/admin/products/[id]` |
| `/admin/products/[id]/variants` |
| `/admin/products/variants/[variantId]` |
| `/admin/returns` |
| `/admin/returns/[id]` |
| `/admin/reviews` |
| `/admin/settings` |
| `/admin/shipments` |
| `/admin/tags` |
| `/admin/ui-showcase` |
| `/admin/users` |

## Backend Alignment

- Cart endpoints use optional auth, so `/cart` is public.
- Wishlist, orders, checkout/order creation, returns, addresses, sessions, and
  profile endpoints require auth.
- Admin API endpoints require `authenticate + authorize(UserRole.ADMIN)`.
- Public catalog/content API endpoints include products, categories, brands,
  blog posts, settings reads, and approved product reviews.
