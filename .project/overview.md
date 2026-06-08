---
name: project-overview
description: Full-stack Persian e-commerce platform — tech stack, domains, deployment, naming conventions
metadata:
  type: project
---

# Project Overview

**Name**: Ex_ecommerce (formerly "Nazi Shop" per README)
**Domain**: Persian (Farsi) e-commerce platform, RTL layout, Vazirmatn font, Persian date/price formatting

## Tech Stack

### Backend
- Express.js + TypeScript
- TypeORM + PostgreSQL
- JWT (access + refresh tokens) via httpOnly cookies
- OTP auth via Kavenegar SMS (passwordless)
- Zod for validation
- Winston for logging
- API prefix: `/api/v1`

### Frontend
- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS v4 with `@theme` directives
- TanStack React Query v5 (server state)
- Zustand v5 (client state)
- Axios (HTTP client via `frontend/src/lib/api-client.ts`)
- React Hook Form + Zod (forms)
- React Hot Toast (notifications)
- `jalaali-js` for Persian date conversion

### DevOps
- Docker + Docker Compose (`docker-compose.yml` for prod, `docker-compose.dev.yml` for dev)
- Backend dev: `nodemon` + `ts-node`
- Frontend dev: Next.js fast refresh

## App Structure

```
Ex_ecommerce/
├── backend/          Express API
├── frontend/         Next.js App
├── docker-compose.yml
├── docker-compose.dev.yml
└── .project/         Project knowledge (this folder)
```

## Business Domains

| Domain        | Entities involved |
|---------------|-------------------|
| Catalog       | products, categories, brands, attributes, variants, tags, images |
| Commerce      | carts, orders, order_items, coupons, payments, shipments |
| Users         | users, user_addresses, roles (customer/admin/support) |
| Engagement    | wishlists, reviews, returns, inventory_logs |
| Auth          | otp_codes, refresh_tokens, login_logs |

## User Roles
- `customer` — default
- `admin` — full access
- `support` — partial admin access (defined in enums but no distinct route guards observed yet)

## Naming Conventions
- Files: `kebab-case` (e.g. `product.service.ts`)
- Classes: `PascalCase`
- Functions/variables: `camelCase`
- DB columns: `snake_case`
- React components: `PascalCase`

## Key URLs (dev)
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000/api/v1`
- Health check: `http://localhost:5000/health`

## Persian-Specific Utilities (frontend)
- `frontend/src/utils/formatPrice.ts` — Persian price formatting
- `frontend/src/utils/formatDate.ts` — Jalali/Persian date formatting
- `frontend/src/utils/toPersianDigits.ts` — Arabic-numeral to Persian-numeral
