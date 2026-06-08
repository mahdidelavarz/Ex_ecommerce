# Module: Brands

## Status Summary

One of the most complete modules — correct pattern, admin-only guards, Zod validators, slug uniqueness, deletion protection, N+1-safe joins, and a fully functional admin CRUD UI with pagination and search. The main gaps are: `is_active` is stored in the DB but never exposed through the DTO or admin form (brands can't be disabled), no customer-facing brand pages exist, and the frontend form doesn't validate the logo URL format before submitting.

---

## Backend

| # | Issue | Severity | File |
|---|-------|----------|------|
| BRD-B1 | `name` column has no uniqueness constraint — duplicate brand names with different slugs can coexist | 🟠 Bug | `brand.entity.ts:12` |
| BRD-B2 | `is_active` field absent from `CreateBrandDto`, `UpdateBrandDto`, and Zod validator — admins cannot disable a brand short of deleting it | 🟠 Bug | `brand.types.ts:21-31`, `brand.validator.ts` |
| BRD-B3 | No `GET /brands/:slug/products` endpoint — product filter workaround exists but no canonical brand→products URL | 🟡 Incomplete | `brand.routes.ts` |

## Frontend

| # | Issue | Severity | File |
|---|-------|----------|------|
| BRD-F1 | No customer-facing brand pages — `/brands` and `/brands/[slug]` routes don't exist; no way for customers to browse by brand | 🟠 Bug | `frontend/src/app/brands/` (missing) |
| BRD-F2 | `is_active` toggle missing from admin edit form — `is_active` shown in list view as a badge but can't be changed | 🟠 Bug | `admin/brands/[id]/page.tsx` |
| BRD-F3 | Logo URL field uses `z.string().nullable()` — no `.url()` check on frontend, mismatch with backend validator causes server-side rejection without inline feedback | 🟡 Incomplete | `admin/brands/[id]/page.tsx:18` |
| BRD-F4 | No logo preview in admin form — admins enter a URL string with no visual feedback until after save | 🟡 Incomplete | `admin/brands/[id]/page.tsx` |

---

## What IS Working

- Module follows `routes → controller → service → repository` pattern correctly
- All write routes guarded with `authenticate` + `authorize(UserRole.ADMIN)`
- Zod validators wired on all mutation routes; logo URL validated as `.url()` on backend
- Slug auto-generated from name with collision detection; DB unique constraint enforced
- Cannot delete a brand that has products (`409` with localized error)
- `GET /brands` returns list with `products_count` per brand
- `GET /brands/all` returns minimal list for dropdowns
- Products list query uses `leftJoinAndSelect` for brand — no N+1
- Brand name search uses parameterized `ILIKE` — safe from SQL injection
- Admin brands page: list with pagination + search, create, edit, delete — fully functional
- Brand displayed on customer product detail page (name + logo with letter fallback)
- Product listing page has working brand filter dropdown
- Mutation hooks (`useCreateBrand`, `useUpdateBrand`, `useDeleteBrand`) used correctly in admin
- Error toasts on success/failure

---

## Fix Solutions

### BRD-B1 — Add uniqueness constraint to name
```ts
// brand.entity.ts
@Column({ type: 'text', unique: true })
name: string;

// brand.repository.ts — add application-level check in create():
const existing = await this.repo.findOne({ where: { name: dto.name.trim() } });
if (existing) throw new ConflictError('برند با این نام قبلاً ثبت شده است');
```

---

### BRD-B2 / BRD-F2 — Expose is_active in DTO, validator, and admin form

**Backend:**
```ts
// brand.types.ts — UpdateBrandDto:
is_active?: boolean;

// brand.validator.ts — updateBrandSchema:
is_active: z.boolean().optional(),

// brand.repository.ts — update():
if (dto.is_active !== undefined) brand.is_active = dto.is_active;
```

**Frontend:**
```tsx
// admin/brands/[id]/page.tsx — add toggle to form:
<div className="flex items-center gap-3">
  <label className="text-sm font-medium">وضعیت برند</label>
  <input
    type="checkbox"
    {...register('is_active')}
    className="w-4 h-4"
  />
  <span className="text-sm text-text-secondary">فعال</span>
</div>
```

---

### BRD-B3 — Add brand products endpoint
```ts
// brand.routes.ts — add before /:id:
router.get('/:slug/products', asyncHandler(controller.getProductsBySlug));

// brand.repository.ts:
async getProductsBySlug(slug: string, page = 1, limit = 20) {
  const brand = await this.repo.findOne({ where: { slug } });
  if (!brand) throw new NotFoundError('برند یافت نشد');
  return productRepo.findAll({ brand_id: brand.id, page, limit });
}
```

---

### BRD-F1 — Create customer-facing brand pages

**`frontend/src/app/brands/page.tsx`** — brand directory:
```tsx
export default function BrandsPage() {
  const { data } = useBrands({ limit: 100 });
  return (
    <div dir="rtl" className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">برندها</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {data?.data?.items?.map(brand => (
          <Link key={brand.id} href={`/brands/${brand.slug}`}
            className="border rounded-lg p-4 flex flex-col items-center gap-2 hover:border-primary">
            {brand.logo_url
              ? <Image src={brand.logo_url} alt={brand.name} width={80} height={80} className="object-contain" />
              : <span className="text-2xl font-bold text-primary">{brand.name[0]}</span>
            }
            <span className="text-sm font-medium">{brand.name}</span>
            <span className="text-xs text-text-secondary">{brand.products_count} محصول</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

**`frontend/src/app/brands/[slug]/page.tsx`** — brand detail + products:
```tsx
export default function BrandPage({ params }: { params: { slug: string } }) {
  const { data: brand } = useBrand(params.slug);
  const { data: products } = useProducts({ brand_id: brand?.data?.id });

  return (
    <div dir="rtl" className="container mx-auto py-8">
      {/* Brand header */}
      <div className="flex items-center gap-4 mb-8">
        {brand?.data?.logo_url && (
          <Image src={brand.data.logo_url} alt={brand.data.name} width={100} height={100}
            className="object-contain border rounded-lg p-2" />
        )}
        <div>
          <h1 className="text-2xl font-bold">{brand?.data?.name}</h1>
          {brand?.data?.description && <p className="text-text-secondary mt-1">{brand.data.description}</p>}
        </div>
      </div>
      <ProductGrid products={products?.data?.items ?? []} />
    </div>
  );
}
```

---

### BRD-F3 — Add URL validation to frontend logo field
```ts
// admin/brands/[id]/page.tsx — update Zod schema:
logo_url: z.string().url('آدرس لوگو نامعتبر است').nullable().optional(),
```

---

### BRD-F4 — Add logo preview
```tsx
// admin/brands/[id]/page.tsx — below logo URL input:
const logoUrl = watch('logo_url');

{logoUrl && (
  <div className="mt-2">
    <img
      src={logoUrl}
      alt="پیش‌نمایش لوگو"
      className="h-16 object-contain border rounded p-1"
      onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
    />
  </div>
)}
```
