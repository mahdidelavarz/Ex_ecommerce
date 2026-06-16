# Module: Brands

## Status Summary

All known issues resolved. The module is production-ready. Brand names are now unique at both DB and application levels, `is_active` is fully exposed through the DTO, validator, repository, and admin form, customer-facing brand pages exist, and the admin form validates the logo URL with a live preview.

---

## Backend

| # | Issue | Severity | File |
|---|-------|----------|------|
| BRD-B1 | ~~`name` column has no uniqueness constraint~~ — ✅ Fixed: added `unique: true` to entity column; application-level `ConflictError` in both `create()` and `update()` when name already exists | 🟠 Bug | `brand.entity.ts:11`, `brand.repository.ts` |
| BRD-B2 | ~~`is_active` absent from DTOs and validator~~ — ✅ Fixed: added to `CreateBrandDto`, `UpdateBrandDto`, both Zod schemas, and `update()` repository method | 🟠 Bug | `brand.types.ts`, `brand.validator.ts`, `brand.repository.ts` |
| BRD-B3 | ~~No `GET /brands/:slug/products` endpoint~~ — ✅ Added: route, controller method, service method, repository method | 🟡 Incomplete | `brand.routes.ts`, `brand.controller.ts`, `brand.service.ts`, `brand.repository.ts` |

## Frontend

| # | Issue | Severity | File |
|---|-------|----------|------|
| BRD-F1 | ~~No customer-facing brand pages~~ — ✅ Created: `/brands` (paginated grid) and `/brands/[slug]` (header + products) | 🟠 Bug | `frontend/src/app/brands/page.tsx`, `frontend/src/app/brands/[slug]/page.tsx` |
| BRD-F2 | ~~`is_active` toggle missing from admin edit form~~ — ✅ Added: toggle with live label (فعال/غیرفعال), wired to form and loaded on edit | 🟠 Bug | `admin/brands/[id]/page.tsx` |
| BRD-F3 | ~~Logo URL field has no frontend validation~~ — ✅ Fixed: form schema uses regex refine for URL format; error rendered below input | 🟡 Incomplete | `admin/brands/[id]/page.tsx` |
| BRD-F4 | ~~No logo preview in admin form~~ — ✅ Added: `<img>` preview renders below URL input when a valid URL is entered; hides on `onError` | 🟡 Incomplete | `admin/brands/[id]/page.tsx` |

---

## What IS Working

- Module follows `routes → controller → service → repository` pattern correctly
- All write routes guarded with `authenticate` + `authorize(UserRole.ADMIN)`
- Zod validators wired on all mutation routes with full Persian error messages
- Brand name unique at DB level (`unique: true`) and application level (`ConflictError`)
- Slug auto-generated from name with collision detection; DB unique constraint enforced
- `is_active` fully exposed: DTO, validator, repository, admin form toggle
- Cannot delete a brand that has products (`409` with localized error)
- `GET /brands` returns paginated list with `products_count` per brand
- `GET /brands/all` returns minimal list for dropdowns
- `GET /brands/:slug/products` returns paginated products for a brand
- Products list query uses `leftJoinAndSelect` for brand — no N+1
- Brand name search uses parameterized `ILIKE` — safe from SQL injection
- Customer-facing pages: `/brands` (directory) and `/brands/[slug]` (detail + products)
- Admin brands page: list with pagination + search, create, edit, delete — fully functional
- Admin form: logo URL validation, live logo preview, `is_active` toggle
- Brand displayed on customer product detail page (name + logo with letter fallback)
- Product listing page has working brand filter dropdown
- Mutation hooks (`useCreateBrand`, `useUpdateBrand`, `useDeleteBrand`) used correctly in admin
