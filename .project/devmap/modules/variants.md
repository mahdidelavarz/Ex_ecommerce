# Module: Variants (& Attributes)

## Status Summary

Backend is mostly solid — inventory logic, auth guards, and Zod validators exist. The critical gaps are on the frontend: the "Add to Cart" button on the product detail page has no onClick handler, the new-variant admin route is broken due to a path mismatch, and the variant selector logic picks the wrong variant under multi-attribute products.

---

## Backend

| # | Issue | Severity | File |
|---|-------|----------|------|
| VAR-B1 | `compare_at_price` not validated > `price` — allows setting a "compare" price lower than actual price | 🟠 Bug | `variant.validator.ts:8,25` |
| VAR-B2 | Variant attribute values missing from order item snapshot — if Color=Red/Size=M is later changed, no record of what was purchased | 🟠 Bug | `order.repository.ts:101-107` |
| VAR-B3 | No soft delete on variants — hard delete removes history; past order items reference a deleted variant | 🟠 Bug | `variant.repository.ts:169-187` |
| VAR-B4 | `image_url` validated only as `z.string()` — no URL format check, XSS/broken-image risk | 🟡 Incomplete | `variant.validator.ts:16` |
| VAR-B5 | `cost_price` not validated ≤ `price` — admin can accidentally create a variant that loses money | 🟡 Incomplete | `variant.validator.ts:9,26` |
| VAR-B6 | Attributes module: `In` import placed at bottom of file (line 167) instead of top | 🟡 Incomplete | `attribute.repository.ts:167` |
| VAR-B7 | No validation that attribute values belong to the product's attribute set — orphaned assignments possible | 🟡 Incomplete | `variant.repository.ts:80-82` |
| VAR-B8 | No image reorder endpoint — `sort_order` column exists but only settable at creation, never updatable | 🟡 Incomplete | `variant.controller.ts:40-48` |

## Frontend

| # | Issue | Severity | File |
|---|-------|----------|------|
| VAR-F1 | "افزودن به سبد خرید" button on product detail page has **no onClick handler** — clicking does nothing | 🔴 Blocker | `products/[slug]/page.tsx:173-179` |
| VAR-F2 | New variant creation route broken — `[id]/variants/page.tsx` pushes to `…/variants/new` but form lives at `/admin/products/variants/[variantId]` and never receives `productId` | 🔴 Blocker | `admin/products/[id]/variants/page.tsx:70,91` |
| VAR-F3 | Variant selector uses `v.attributes.some(a => a.id === val.id)` — finds first variant with ANY matching attribute, not the variant matching the full combination (e.g. Red+Large vs Red+Small) | 🟠 Bug | `products/[slug]/page.tsx:200-206` |
| VAR-F4 | Quantity "+" button has no upper bound — can exceed `stock_quantity`; caught on checkout but bad UX | 🟠 Bug | `products/[slug]/page.tsx:159-172` |
| VAR-F5 | No attributes management UI — can't create attributes or attribute values from the admin panel | 🟠 Bug | `frontend/src/app/admin/` |
| VAR-F6 | No image upload/management UI on variant edit form — backend supports it, frontend doesn't expose it | 🟡 Incomplete | `admin/products/variants/[variantId]/page.tsx` |
| VAR-F7 | Out-of-stock variants not visually disabled in selector — user can "select" a 0-stock variant | 🟡 Incomplete | `products/[slug]/page.tsx:197-226` |
| VAR-F8 | `compare_at_price` not validated > `price` on frontend Zod schema either | 🟡 Incomplete | `admin/products/variants/[variantId]/page.tsx:21` |
| VAR-F9 | Variant edit form has no loading state while fetching and no error boundary on fetch failure | 🟡 Incomplete | `admin/products/variants/[variantId]/page.tsx:60-83` |

---

## What IS Working

- Stock decremented in DB transaction on order creation (`order.repository.ts`)
- Stock restored on order cancellation
- Cart service validates quantity against `stock_quantity` at add-to-cart
- Admin routes guarded with `authenticate` + `authorize(UserRole.ADMIN)`
- Basic Zod validators on POST/PATCH (price ≥ 0, required fields)
- SKU uniqueness enforced in DB
- Hard-delete prevented if variant has existing order items
- Attribute value deletion prevented if value is in use
- Bulk stock update endpoint functional
- Inventory change log created on stock decrement/restore

---

## Fix Solutions

### VAR-F1 — Wire onClick to Add-to-Cart button
The product detail page has an inline button that never calls the cart. Either wire the existing `AddToCartButton` component (which handles guest/auth flow) or add the call directly:
```tsx
// products/[slug]/page.tsx — replace the bare <button>:
import { AddToCartButton } from '@/modules/cart/components/AddToCartButton';

<AddToCartButton
  variantId={currentVariant.id}
  stockQuantity={currentVariant.stock_quantity}
  quantity={quantity}
/>
```
This also fixes the existing `AddToCartButton` login-gate issue (tracked as C-F1) in one place.

---

### VAR-F2 — Fix new variant route + pass productId
```tsx
// admin/products/[id]/variants/page.tsx:70
// BEFORE:
router.push(`/admin/products/${productId}/variants/new`);

// AFTER:
router.push(`/admin/products/variants/new?productId=${productId}`);
```
The form at `admin/products/variants/[variantId]/page.tsx` already reads `productId` from `searchParams`, so this single change is sufficient.

---

### VAR-F3 — Fix variant selection for multi-attribute products
Track all selected attribute value IDs, then find the variant that matches all of them:
```tsx
// products/[slug]/page.tsx
const [selectedAttributeValues, setSelectedAttributeValues] = useState<Record<string, string>>({});
// Key = attribute_id, Value = attribute_value_id

const handleAttributeSelect = (attributeId: string, valueId: string) => {
  const updated = { ...selectedAttributeValues, [attributeId]: valueId };
  setSelectedAttributeValues(updated);

  const selectedValueIds = Object.values(updated);
  const matchedVariant = product.variants.find(v =>
    selectedValueIds.every(vid => v.attributes.some(a => a.id === vid))
  );
  if (matchedVariant) setSelectedVariant(matchedVariant);
};
```

---

### VAR-F4 — Cap quantity at stock_quantity
```tsx
// products/[slug]/page.tsx
<button
  onClick={() => setQuantity(q => Math.min(q + 1, currentVariant.stock_quantity))}
  disabled={quantity >= currentVariant.stock_quantity}
>
```

---

### VAR-F5 — Add attributes management UI
Create `frontend/src/app/admin/attributes/page.tsx` with:
- List all attributes + their values
- Create/edit/delete attributes
- Add/edit/delete attribute values (with color_code input for color-type attributes)
This page is entirely missing. The backend `GET/POST/PATCH/DELETE /attributes` endpoints already exist.

---

### VAR-F7 — Disable out-of-stock variants visually
```tsx
// products/[slug]/page.tsx — in variant attribute value buttons:
const isOutOfStock = !product.variants.some(v =>
  v.attributes.some(a => a.id === val.id) && v.stock_quantity > 0
);

<button
  onClick={() => !isOutOfStock && handleAttributeSelect(attr.id, val.id)}
  className={clsx(
    'border rounded px-3 py-1',
    isOutOfStock && 'opacity-40 cursor-not-allowed line-through',
    selectedAttributeValues[attr.id] === val.id && 'border-primary',
  )}
>
  {val.value}
</button>
```

---

### VAR-B1 / VAR-F8 — Validate compare_at_price > price
```ts
// variant.validator.ts — add .superRefine() at schema level:
.superRefine((data, ctx) => {
  if (data.compare_at_price != null && data.price != null
      && data.compare_at_price <= data.price) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'قیمت مقایسه باید بزرگ‌تر از قیمت فروش باشد',
      path: ['compare_at_price'],
    });
  }
});
```
Apply the same `.superRefine()` to the frontend Zod schema.

---

### VAR-B2 — Snapshot variant attributes in order item
```ts
// order.repository.ts — inside product_snapshot:
product_snapshot: {
  product_id: variant.product?.id,
  variant_id: variant.id,
  title:      variant.product?.title,
  sku:        variant.sku,
  price:      variant.price,
  attributes: variant.variant_attribute_values?.map(vav => ({
    attribute: vav.attribute_value?.attribute?.name,
    value:     vav.attribute_value?.value,
  })) ?? [],
},
```
This is a non-breaking addition (JSONB column, extra field).

---

### VAR-B3 — Add soft delete to ProductVariant
```ts
// product-variant.entity.ts — add:
@DeleteDateColumn({ name: 'deleted_at', nullable: true })
deleted_at: Date | null;

// variant.repository.ts — replace hard delete:
async softDelete(variantId: string) {
  await this.variantRepo.softDelete(variantId);
}

// All find queries — TypeORM respects @DeleteDateColumn automatically with softDelete
```
