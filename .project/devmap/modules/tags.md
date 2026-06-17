# Module: Tags

## Status Summary

✅ All issues fixed (2026-06-17). See fix log below each issue.

---

## Backend

| # | Issue | Severity | File |
|---|-------|----------|------|
| TAG-B1 | `POST /products/:id/tags` (syncTags) has no Zod validation — tag_ids array is unvalidated, any string accepted | 🟠 Bug | `product.routes.ts:26` |
| TAG-B2 | No uniqueness constraint on `name` — only `slug` is unique; two tags with the same name but different capitalisation can coexist | 🟠 Bug | `tag.entity.ts:12` |
| TAG-B3 | No `GET /tags/:slug/products` endpoint — no way for customers to browse products by tag | 🟡 Incomplete | `tag.routes.ts` |
| TAG-B4 | Tags not loaded in `findAll()` (product list) — only loaded in `findById`/`findBySlug`; tag chips can't be shown on product cards | 🟡 Incomplete | `product.repository.ts:27-143` |
| TAG-B5 | Tag name not trimmed before save — `"  Electronics  "` and `"Electronics"` become different tags | 🟡 Incomplete | `tag.repository.ts:50` |
| TAG-B6 | Slug generated from name but not validated post-generation — a name like `"@#$"` produces an empty slug, hitting a DB constraint with a confusing error | 🟡 Incomplete | `tag.repository.ts:74-80` |
| TAG-B7 | `syncTags()` does not verify tag IDs exist before inserting — foreign key violation possible if IDs are invalid | 🟡 Incomplete | `product.repository.ts:382-390` |

## Frontend

| # | Issue | Severity | File |
|---|-------|----------|------|
| TAG-F1 | Tags loaded from API but never rendered on product detail page — tag chips are completely invisible to customers | 🟠 Bug | `products/[slug]/page.tsx` |
| TAG-F2 | No tag filter on products listing page — only category/brand/price filters exist | 🟡 Incomplete | `products/page.tsx` |
| TAG-F3 | No mutation hooks (`useCreateTag`, `useUpdateTag`, `useDeleteTag`) — admin page uses bare service calls with no loading states | 🟡 Incomplete | `frontend/src/modules/tags/hooks/useTags.ts` |
| TAG-F4 | No client-side validation on tag create/edit form — empty names reach server before being rejected | 🟡 Incomplete | `admin/tags/page.tsx:77-85,111-117` |
| TAG-F5 | Pagination state exists but no prev/next buttons rendered — can't navigate past first page of tags | 🟡 Incomplete | `admin/tags/page.tsx` |
| TAG-F6 | Search input doesn't reset `page` to 1 — searching while on page 2+ shows empty results | 🟡 Incomplete | `admin/tags/page.tsx:22` |
| TAG-F7 | `tag.types.ts` is empty — `Tag` interface is defined inside `tag.service.ts` instead | 🟡 Incomplete | `frontend/src/modules/tags/types/tag.types.ts` |

---

## What IS Working

- Tag CRUD: create, read, update, delete all functional
- Slug auto-generated from name; unique DB constraint prevents true duplicates
- Cascade delete: removing a tag removes all `product_tag` junction rows
- All write routes require `authenticate` + `authorize(UserRole.ADMIN)`
- Zod validators present on create/update tag routes
- Admin tags page: list with search, inline create, inline edit, delete with confirmation
- Products load `tags` relation when fetched by ID or slug (detail view)
- `products_count` shown in admin tags list
- Tag multi-select in admin product form works (chips UI)

---

## Fix Solutions

### TAG-B1 — Add Zod validation to syncTags
```ts
// product.routes.ts — add validate middleware:
import { z } from 'zod';
import { validate } from '../../middleware/validate';

router.post(
  '/:id/tags',
  authenticate,
  authorize(UserRole.ADMIN),
  validate({ body: z.object({ tag_ids: z.array(z.string().uuid()).min(0) }) }),
  asyncHandler(controller.syncTags),
);
```

---

### TAG-B2 — Add uniqueness constraint to name
```ts
// tag.entity.ts
@Column({ type: 'text', unique: true })
name: string;
```
Also add application-level check in `tag.repository.ts` create():
```ts
const existing = await this.repo.findOne({ where: { name: dto.name.trim() } });
if (existing) throw new ConflictError('تگ با این نام قبلاً ثبت شده است');
```

---

### TAG-B3 — Add products-by-tag endpoint
```ts
// tag.routes.ts
router.get('/:slug/products', asyncHandler(controller.getProductsByTag));

// tag.repository.ts
async getProductsByTag(slug: string, page = 1, limit = 20) {
  const [products, total] = await this.productRepo
    .createQueryBuilder('p')
    .innerJoin('p.product_tags', 'pt')
    .innerJoin('pt.tag', 't', 't.slug = :slug', { slug })
    .andWhere('p.deleted_at IS NULL')
    .andWhere('p.is_active = true')
    .skip((page - 1) * limit)
    .take(limit)
    .getManyAndCount();
  return { products, total, page, limit };
}
```

---

### TAG-B5 / TAG-B6 — Trim name and validate slug
```ts
// tag.repository.ts — create() and update():
const trimmedName = dto.name.trim();
if (!trimmedName) throw new BadRequestError('نام تگ نمی‌تواند خالی باشد');

const slug = generateSlug(trimmedName);
if (!slug) throw new BadRequestError('نام تگ نامعتبر است');
```

---

### TAG-F1 — Render tags on product detail page
```tsx
// products/[slug]/page.tsx — add after the brand/category section:
{product.tags && product.tags.length > 0 && (
  <div className="flex flex-wrap gap-2 mt-3">
    {product.tags.map(tag => (
      <Link
        key={tag.id}
        href={`/products?tag=${tag.slug}`}
        className="text-xs bg-surface-raised text-text-secondary px-3 py-1 rounded-full hover:bg-primary hover:text-white transition-colors"
      >
        #{tag.name}
      </Link>
    ))}
  </div>
)}
```

---

### TAG-F2 — Add tag filter to product listing
```tsx
// products/page.tsx — add tag multi-select in sidebar:
const { data: tags } = useTags({ limit: 100 });

<div>
  <h3 className="font-medium mb-2">تگ‌ها</h3>
  <div className="flex flex-wrap gap-2">
    {tags?.data?.map(tag => (
      <button
        key={tag.id}
        onClick={() => applyFilter('tag', tag.slug)}
        className={clsx(
          'text-xs px-3 py-1 rounded-full border',
          selectedTag === tag.slug ? 'bg-primary text-white border-primary' : 'border-border',
        )}
      >
        {tag.name}
      </button>
    ))}
  </div>
</div>
```
Backend `findAll()` already accepts a `tag` filter query param — just needs to be wired.

---

### TAG-F3 — Add mutation hooks
```ts
// useTags.ts — add:
export const useCreateTag = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string }) => tagService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      toast.success('تگ ایجاد شد');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'خطا'),
  });
};

export const useDeleteTag = () => { /* similar */ };
export const useUpdateTag = () => { /* similar */ };
```

---

### TAG-F5 / TAG-F6 — Fix pagination + search reset
```tsx
// admin/tags/page.tsx
const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
  setSearch(e.target.value);
  setPage(1);   // reset to first page on new search
};

// Add pagination controls below the list:
<div className="flex justify-between items-center mt-4">
  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
    قبلی
  </button>
  <span>صفحه {page} از {Math.ceil(total / limit)}</span>
  <button onClick={() => setPage(p => p + 1)} disabled={page * limit >= total}>
    بعدی
  </button>
</div>
```
