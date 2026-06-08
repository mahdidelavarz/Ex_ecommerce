# Module: Categories

## Status Summary

One of the better-built modules — correct pattern, admin-only guards, Zod validators, circular-reference prevention, and forced-cascade delete all in place. The critical production gap is a missing customer-facing `/categories/[slug]` page: the mega menu links to it but the route returns 404. The main performance risk is an N+1 recursive query that fires once per category level on every filtered product list request.

---

## Backend

| # | Issue | Severity | File |
|---|-------|----------|------|
| CAT-B1 | `getAllChildrenIds()` makes one DB query per category level — 100-category hierarchy = ~100 queries per product list request with category filter | 🟠 Bug | `category.repository.ts:244-257`, `product.repository.ts:419-430` |
| CAT-B2 | `limit` query param accepted as raw string — no transformation to number, no upper bound; `?limit=999999999` is valid | 🟠 Bug | `category.validator.ts:66-68` |
| CAT-B3 | `updateCategorySchema` missing Persian error messages — update errors are generic English while create errors are localized | 🟡 Incomplete | `category.validator.ts:24-43` |
| CAT-B4 | No `GET /categories/:slug/products` endpoint — only `GET /products?category_id=` workaround exists | 🟡 Incomplete | `category.routes.ts` |
| CAT-B5 | `icon` field accepts any string — no Iconify format validation (e.g. `mdi:folder`) | 🟡 Incomplete | `category.validator.ts:12,33` |
| CAT-B6 | Parent existence not verified before circular-reference check — DB constraint fires with a generic error instead of "دسته‌بندی والد یافت نشد" | 🟡 Incomplete | `category.repository.ts:104-107` |

## Frontend

| # | Issue | Severity | File |
|---|-------|----------|------|
| CAT-F1 | No `/categories/[slug]` page — mega menu and mobile menu link to this route but it returns 404 | 🔴 Blocker | `frontend/src/app/categories/` (missing) |
| CAT-F2 | Parent dropdown includes the current category itself and all its descendants — UI allows selecting invalid parents that the backend immediately rejects | 🟠 Bug | `admin/categories/[id]/page.tsx:179-189` |
| CAT-F3 | No mutation hooks (`useCreateCategory`, `useUpdateCategory`, `useDeleteCategory`) — forms call `categoryService` directly; cache invalidated via manual `refetch()` | 🟡 Incomplete | `frontend/src/modules/categories/hooks/useCategories.ts` |
| CAT-F4 | Delete confirmation only mentions child count, not product count — user sees a generic confirm dialog then gets a server error if products exist | 🟡 Incomplete | `admin/categories/page.tsx:42-45` |
| CAT-F5 | Parent dropdown hard-capped at `limit: 100` — stores with 100+ categories silently truncate the parent options | 🟡 Incomplete | `admin/categories/[id]/page.tsx:41` |
| CAT-F6 | Icon input has no Iconify format validation — invalid strings saved and silently break category icons in the mega menu | 🟡 Incomplete | `admin/categories/[id]/page.tsx:267-271` |

---

## What IS Working

- Module follows `routes → controller → service → repository` pattern correctly
- All write routes guarded with `authenticate` + `authorize(UserRole.ADMIN)`
- Zod validators wired on all mutation routes
- Circular reference prevention: both self-parent (`parent_id === id`) and deep descendant checks
- Slug auto-generated from name; DB unique constraint enforced
- `GET /categories/tree` returns full active hierarchy
- Cannot delete a category that has products (`409` with localized error)
- Force delete (`?force=true`) recursively deletes all descendants
- Product `findAll()` expands category filter to include all descendant category IDs
- Mega menu and mobile menu display the full category tree with icons
- Breadcrumb on product detail page (`Home > Category > Product`)
- Products listing page has a working category filter dropdown
- Admin CRUD: list with pagination + search, create, edit, delete — all functional
- Parent selector dropdown in admin form
- SEO fields (`seo_title`, `seo_description`) present and validated
- `is_active` flag supported; inactive categories excluded from tree endpoint

---

## Fix Solutions

### CAT-B1 — Replace N+1 recursion with a single PostgreSQL CTE
```ts
// category.repository.ts — replace getAllChildrenIds():
async getAllChildrenIds(categoryId: string): Promise<string[]> {
  const rows: { id: string }[] = await this.repo.query(
    `WITH RECURSIVE tree AS (
       SELECT id FROM categories WHERE parent_id = $1
       UNION ALL
       SELECT c.id FROM categories c INNER JOIN tree t ON c.parent_id = t.id
     )
     SELECT id FROM tree`,
    [categoryId],
  );
  return rows.map(r => r.id);
}
```
Apply the same CTE pattern to `getCategoryChildrenIds()` in `product.repository.ts`. This reduces N+1 to a single round-trip regardless of hierarchy depth.

---

### CAT-B2 — Transform and bound limit parameter
```ts
// category.validator.ts — update categoryQuerySchema:
limit: z.string()
  .transform(Number)
  .pipe(z.number().int().min(1).max(100))
  .optional(),
```

---

### CAT-B4 — Add products-by-category endpoint
```ts
// category.routes.ts — add before /:id:
router.get('/:slug/products', asyncHandler(controller.getProductsBySlug));

// category.repository.ts:
async getProductsBySlug(slug: string, page = 1, limit = 20) {
  const category = await this.repo.findOne({ where: { slug } });
  if (!category) throw new NotFoundError('دسته‌بندی یافت نشد');
  const childIds = await this.getAllChildrenIds(category.id);
  const allIds = [category.id, ...childIds];
  return productRepo.findAll({ category_ids: allIds, page, limit });
}
```

---

### CAT-F1 — Create customer-facing category page
Create `frontend/src/app/categories/[slug]/page.tsx`:
```tsx
export default function CategoryPage({ params }: { params: { slug: string } }) {
  const { data: category } = useCategory(params.slug);
  const { data: products } = useProducts({ category_id: category?.data?.id });

  return (
    <div dir="rtl">
      {/* Breadcrumb */}
      <nav className="text-sm text-text-secondary mb-4">
        <Link href="/">خانه</Link> / <span>{category?.data?.name}</span>
      </nav>

      {/* Category header */}
      {category?.data?.image_url && (
        <Image src={category.data.image_url} alt={category.data.name} ... />
      )}
      <h1>{category?.data?.name}</h1>
      {category?.data?.description && <p>{category.data.description}</p>}

      {/* Sub-categories */}
      {category?.data?.children?.length > 0 && (
        <div className="flex gap-3 flex-wrap mb-6">
          {category.data.children.map(child => (
            <Link key={child.id} href={`/categories/${child.slug}`}
              className="border rounded px-4 py-2 text-sm">
              {child.name}
            </Link>
          ))}
        </div>
      )}

      {/* Products grid */}
      <ProductGrid products={products?.data?.items ?? []} />
    </div>
  );
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const category = await categoryService.getBySlug(params.slug);
  return {
    title: category.data.seo_title ?? category.data.name,
    description: category.data.seo_description ?? category.data.description,
  };
}
```

---

### CAT-F2 — Filter invalid parents from dropdown
```tsx
// admin/categories/[id]/page.tsx
// When editing, exclude self and all descendants:
const [descendantIds, setDescendantIds] = useState<string[]>([]);

useEffect(() => {
  if (isEdit && params.id) {
    // Fetch descendants to exclude — or compute from loaded tree
    categoryService.getDescendantIds(params.id).then(setDescendantIds);
  }
}, [isEdit, params.id]);

const validParents = categoriesData?.data?.filter(cat =>
  cat.id !== params.id && !descendantIds.includes(cat.id)
);

// In JSX:
{validParents?.map(cat => (
  <option key={cat.id} value={cat.id}>{cat.name}</option>
))}
```

---

### CAT-F3 — Add mutation hooks
```ts
// useCategories.ts — add:
export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCategoryDto) => categoryService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('دسته‌بندی ایجاد شد');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'خطا'),
  });
};
// Similarly: useUpdateCategory, useDeleteCategory
```

---

### CAT-F4 — Include product count in delete confirmation
```tsx
// admin/categories/page.tsx
const confirmMessage = [
  category.children_count > 0
    ? `این دسته‌بندی ${category.children_count} زیرمجموعه دارد`
    : null,
  category.products_count > 0
    ? `${category.products_count} محصول دارد`
    : null,
].filter(Boolean).join(' و ');

const message = confirmMessage
  ? `${confirmMessage}. آیا مطمئن هستید؟`
  : 'آیا از حذف این دسته‌بندی اطمینان دارید؟';
```
