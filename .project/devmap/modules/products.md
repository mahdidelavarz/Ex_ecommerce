# Module: Products

## Backend

| # | Issue | Severity | File |
|---|-------|----------|------|
| PRD-B1 | ~~`GET /:slug/related` unreachable — declared after `GET /:slug`~~ ✅ Fixed — swapped route order | 🔴 Blocker | `product.routes.ts:16` |
| PRD-B2 | ~~Price max filter uses `MIN(variants.price)` instead of `MAX`~~ ✅ Fixed — `andHaving("MAX(variants.price) <= :maxPrice")` | 🟠 Bug | `product.repository.ts:84` |
| PRD-B3 | ~~`findRelated()` missing `deleted_at IS NULL`~~ ✅ Fixed — added `is_active`, `is_public`, `deleted_at IS NULL` | 🟠 Bug | `product.repository.ts:209` |
| PRD-B4 | ~~No thumbnail reset before setting new one~~ ✅ Already correct — `imageRepo.update({ product_id }, { is_thumbnail: false })` resets all before insert | 🟠 Bug | `product.repository.ts:~365` |
| PRD-B5 | ~~`getCategoryChildrenIds()` N+1 recursive DB calls~~ ✅ Fixed — replaced with PostgreSQL recursive CTE | 🟡 Incomplete | `product.repository.ts` |
| PRD-B6 | `bulkStatus()` not transactional — partial failure leaves products in mixed state | 🟡 Incomplete | `product.service.ts` |

## Frontend

| # | Issue | Severity | File |
|---|-------|----------|------|
| PRD-F1 | ~~`dangerouslySetInnerHTML` with no sanitization~~ ✅ Fixed — `DOMPurify.sanitize()` via `isomorphic-dompurify` | 🔴 Blocker | `products/[slug]/page.tsx` |
| PRD-F2 | ~~Page crashes when `product.variants` empty/undefined~~ ✅ Fixed — `activeVariants` filter + null-safe `currentVariant` | 🔴 Blocker | `products/[slug]/page.tsx` |
| PRD-F3 | ~~JSX syntax error: `< MdiMinus`~~ ✅ Fixed — inline button replaced with `<AddToCartButton>` | 🔴 Blocker | `products/[slug]/page.tsx` |
| PRD-F4 | ~~Discount badge uses `minPrice < maxPrice`~~ ✅ Fixed — backend `BOOL_OR(compare_at_price > price)` → `has_discount` field | 🟠 Bug | `ProductCard.tsx` |
| PRD-F5 | ~~`AddToCartButton` not wired to `currentVariant.id`~~ ✅ Fixed — `<AddToCartButton variantId={currentVariant.id} stockQuantity={...} />` | 🟠 Bug | `products/[slug]/page.tsx` |
| PRD-F6 | ~~Filters not persisted to URL~~ ✅ Fixed — all filter state URL-derived via `useSearchParams` + `useRouter.push` | 🟡 Incomplete | `products/page.tsx` |
| PRD-F7 | ~~No mobile filter UI~~ ✅ Fixed — mobile toggle button + RTL slide-in drawer overlay | 🟡 Incomplete | `products/page.tsx` |
| PRD-F8 | No SEO metadata — `'use client'` constraint prevents `generateMetadata` | 🟡 Incomplete | `products/[slug]/page.tsx` |
| PRD-F9 | ~~Plain `<img>` everywhere~~ ✅ Fixed — `next/image` in `ProductCard.tsx` and `products/[slug]/page.tsx` | 🟡 Incomplete | `ProductCard.tsx`, `products/[slug]/page.tsx` |
| PRD-F10 | Admin product form accepts image URL strings only — no file upload UI | 🟡 Incomplete | `admin/products/[id]/page.tsx` |
| PRD-F11 | Variant images cannot be managed from admin UI | 🟡 Incomplete | `admin/products/[id]/variants/page.tsx` |
| PRD-F12 | Product `specification` field has no form editor in admin | 🟡 Incomplete | `admin/products/[id]/page.tsx` |

## Fix Solutions

### PRD-B1 — Fix route ordering
```ts
// product.routes.ts — more specific routes must come before parameterised ones:
// BEFORE:
router.get('/:slug', controller.getBySlug);
router.get('/:slug/related', controller.getRelated);

// AFTER:
router.get('/:slug/related', controller.getRelated);
router.get('/:slug', controller.getBySlug);
```
Same pattern fixed simultaneously in `order.routes.ts` (O-B1).

### PRD-B2 — Fix price max filter
```ts
// product.repository.ts
// BEFORE:
qb.andHaving('MIN(variants.price) <= :maxPrice', { maxPrice: filters.maxPrice });

// AFTER:
qb.andHaving('MAX(variants.price) <= :maxPrice', { maxPrice: filters.maxPrice });
```

### PRD-B3 — Filter deleted products from related
```ts
// product.repository.ts — findRelated() query builder, add:
qb.andWhere('p.deleted_at IS NULL')
  .andWhere('p.is_active = true')
  .andWhere('p.is_public = true');
```

### PRD-B4 — Reset thumbnail before setting new one
```ts
// product.repository.ts — in addImage(), before inserting thumbnail:
if (dto.is_thumbnail) {
  await this.productImageRepo.update(
    { product_id: productId, is_thumbnail: true },
    { is_thumbnail: false }
  );
}
```

### PRD-F1 — Sanitize HTML with isomorphic-dompurify
```bash
# frontend/
npm install isomorphic-dompurify
```
```tsx
// products/[slug]/page.tsx
import DOMPurify from 'isomorphic-dompurify';

<div
  dangerouslySetInnerHTML={{
    __html: DOMPurify.sanitize(product.full_description ?? '')
  }}
/>
```

### PRD-F2 — Guard against empty variants
```tsx
// products/[slug]/page.tsx
const hasVariants = (product?.variants?.length ?? 0) > 0;
const [selectedVariantId, setSelectedVariantId] = useState(
  hasVariants ? product.variants[0].id : null
);
const currentVariant = hasVariants
  ? (product.variants.find(v => v.id === selectedVariantId) ?? product.variants[0])
  : null;

// Show unavailable state when currentVariant is null:
if (!currentVariant) {
  return <p className="text-red-500">این محصول در حال حاضر در دسترس نیست</p>;
}
```

### PRD-F3 — Fix JSX syntax error
```tsx
// products/[slug]/page.tsx:163
// BEFORE:
< MdiMinus className="w-4 h-4" />

// AFTER:
<MdiMinus className="w-4 h-4" />
```

### PRD-F4 — Fix discount badge logic
```tsx
// ProductCard.tsx
// BEFORE:
const hasDiscount = minPrice < maxPrice;

// AFTER — requires backend to expose has_discount in ProductListResponse:
const hasDiscount = product.has_discount ?? false;

// Backend fix — product.repository.ts list query, add to SELECT:
// CASE WHEN EXISTS (SELECT 1 FROM variants WHERE product_id = p.id AND compare_at_price > price)
//      THEN true ELSE false END AS has_discount
```

### PRD-F5 — Wire AddToCartButton to currentVariant
```tsx
// products/[slug]/page.tsx — ensure AddToCartButton receives variant context:
<AddToCartButton
  variantId={currentVariant.id}
  stockQuantity={currentVariant.stock_quantity}
/>
```

### PRD-F6 — Persist filters to URL
```tsx
// products/page.tsx
import { useRouter, useSearchParams } from 'next/navigation';

const router = useRouter();
const searchParams = useSearchParams();

const applyFilter = useCallback((key: string, value: string | null) => {
  const params = new URLSearchParams(searchParams.toString());
  value ? params.set(key, value) : params.delete(key);
  router.push(`/products?${params.toString()}`, { scroll: false });
}, [searchParams, router]);
```
Debounce price inputs 300ms before calling `applyFilter`.

### PRD-F8 — Add SEO metadata
```tsx
// products/[slug]/page.tsx
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { data: product } = await productService.getBySlug(params.slug);
  const thumbnail = product.images.find(i => i.is_thumbnail)?.image_url ?? '';
  return {
    title: product.seo?.title ?? product.title,
    description: product.seo?.description ?? product.short_description,
    openGraph: { images: [thumbnail] },
  };
}
```

### PRD-F9 — Replace `<img>` with `next/image`
```tsx
import Image from 'next/image';

// ProductCard.tsx:
<div className="relative aspect-square">
  <Image src={imageUrl} alt={product.title} fill className="object-cover"
    sizes="(max-width: 768px) 50vw, 25vw" />
</div>
```
Add upload host to `next.config.ts`:
```ts
images: { remotePatterns: [{ hostname: process.env.UPLOAD_HOST ?? 'localhost' }] }
```
