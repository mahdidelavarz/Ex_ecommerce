# Module: Categories

## Status Summary

All known issues resolved. The module is production-ready. The N+1 recursive query is replaced with a single PostgreSQL CTE, the customer-facing `/categories/[slug]` page is created, the admin parent dropdown is safe and unbounded, and all validators have Persian error messages and Iconify format enforcement.

---

## Backend

| # | Issue | Severity | File |
|---|-------|----------|------|
| CAT-B1 | ~~`getAllChildrenIds()` makes one DB query per category level — N+1 recursive query~~ — ✅ Fixed with PostgreSQL CTE in both `category.repository.ts` and `product.repository.ts` | 🟠 Bug | `category.repository.ts:244`, `product.repository.ts:419` |
| CAT-B2 | ~~`limit` query param accepted as raw string — no transformation to number, no upper bound~~ — ✅ Fixed: `.transform(Number).pipe(z.number().int().min(1).max(100))` | 🟠 Bug | `category.validator.ts:66-68` |
| CAT-B3 | ~~`updateCategorySchema` missing Persian error messages~~ — ✅ Fixed: all fields in both schemas now have Persian messages | 🟡 Incomplete | `category.validator.ts:24-43` |
| CAT-B4 | ~~No `GET /categories/:slug/products` endpoint~~ — ✅ Added: route, controller method, service method, repository method | 🟡 Incomplete | `category.routes.ts`, `category.controller.ts`, `category.service.ts`, `category.repository.ts` |
| CAT-B5 | ~~`icon` field accepts any string — no Iconify format validation~~ — ✅ Fixed: both schemas now enforce `/^[a-z0-9-]+:[a-z0-9-]+$/` | 🟡 Incomplete | `category.validator.ts:12,33` |
| CAT-B6 | ~~Parent existence not verified before circular-reference check~~ — ✅ Already fixed: `validateParent()` throws `NotFoundError("دسته‌بندی والد یافت نشد")` before circular check | 🟡 Incomplete | `category.repository.ts:227-242` |

## Frontend

| # | Issue | Severity | File |
|---|-------|----------|------|
| CAT-F1 | ~~No `/categories/[slug]` page — mega menu and mobile menu return 404~~ — ✅ Created: breadcrumb, category header, sub-categories, products grid | 🔴 Blocker | `frontend/src/app/categories/[slug]/page.tsx` |
| CAT-F2 | ~~Parent dropdown includes current category and all descendants~~ — ✅ Fixed: uses `useCategoryTree()`, computes and excludes self + descendants via tree traversal | 🟠 Bug | `admin/categories/[id]/page.tsx` |
| CAT-F3 | ~~No mutation hooks — forms call service directly, cache invalidated via `refetch()`~~ — ✅ Added: `useCreateCategory`, `useUpdateCategory`, `useDeleteCategory` with `invalidateQueries` | 🟡 Incomplete | `frontend/src/modules/categories/hooks/useCategories.ts` |
| CAT-F4 | ~~Delete confirmation only mentions child count, not product count~~ — ✅ Fixed: blocks delete with `toast.error` immediately if `products_count > 0` | 🟡 Incomplete | `admin/categories/page.tsx:42-45` |
| CAT-F5 | ~~Parent dropdown hard-capped at `limit: 100`~~ — ✅ Fixed: switched from `useCategories({ limit: 100 })` to `useCategoryTree()` — all categories, no cap | 🟡 Incomplete | `admin/categories/[id]/page.tsx:41` |
| CAT-F6 | ~~Icon input has no Iconify format validation~~ — ✅ Fixed: form schema enforces `/^[a-z0-9-]+:[a-z0-9-]+$/`; error message rendered below input | 🟡 Incomplete | `admin/categories/[id]/page.tsx:267-271` |

---

## What IS Working

- Module follows `routes → controller → service → repository` pattern correctly
- All write routes guarded with `authenticate` + `authorize(UserRole.ADMIN)`
- Zod validators wired on all mutation routes with full Persian error messages
- Circular reference prevention: both self-parent and deep descendant checks
- Parent existence validated before circular check (`validateParent`)
- Slug auto-generated from name; DB unique constraint enforced
- `GET /categories/tree` returns full active hierarchy
- `GET /categories/:slug/products` returns paginated products for a category and all its descendants
- Cannot delete a category that has products (`409` with localized error)
- Force delete (`?force=true`) recursively deletes all descendants
- Product `findAll()` expands category filter to include all descendant IDs (via CTE — single query)
- Mega menu, mobile menu, and customer-facing `/categories/[slug]` page all functional
- Breadcrumb on product detail page (`Home > Category > Product`)
- Products listing page has a working category filter dropdown
- Admin CRUD: list with pagination + search, create, edit, delete — all functional
- Parent selector in admin form: all categories via tree, self + descendants excluded when editing
- Icon field validated as Iconify format on both backend and frontend
- SEO fields (`seo_title`, `seo_description`) present and validated
- `is_active` flag supported; inactive categories excluded from tree endpoint
- Mutation hooks (`useCreateCategory`, `useUpdateCategory`, `useDeleteCategory`) with cache invalidation
