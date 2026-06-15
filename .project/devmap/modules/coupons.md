# Module: Coupons

## Backend

| # | Issue | Severity | File |
|---|-------|----------|------|
| CPN-B1 | `validate()` loads `coupon_categories` but **never checks them** — category-restricted coupons accepted for any order | 🔴 Blocker | `coupon.repository.ts:250` |
| CPN-B2 | Percentage ≤ 100 validated on **create only** — `updateCouponSchema.partial()` drops the constraint | 🟠 Bug | `coupon.validator.ts` |
| CPN-B3 | `free_shipping` discount hardcoded to `0` — never connected to actual shipping cost | 🟡 Incomplete | `coupon.repository.ts:272` |
| CPN-B4 | `used_count` never incremented when an order uses a coupon (fix lives in `order.repository.ts`) | 🟠 Bug | `order.repository.ts` |

## Frontend

| # | Issue | Severity | File |
|---|-------|----------|------|
| CPN-F1 | Admin coupon form has `product_ids` / `category_ids` in Zod schema but **no UI fields** — restrictions can never be configured | 🔴 Blocker | `admin/coupons/[id]/page.tsx:30` |
| CPN-F2 | `useProducts?.()` — optional chaining on a call expression is a syntax error; should be `useProducts()` | 🟠 Bug | `admin/coupons/[id]/page.tsx:43` |
| CPN-F3 | Admin coupon list omits `min_order_amount`, `max_discount`, `usage_per_user` columns | 🟡 Incomplete | `admin/coupons/page.tsx` |
| CPN-F4 | No mutation hooks — form calls API directly with untyped `any` payload | 🟡 Incomplete | `useCoupons.ts` |
| CPN-F5 | Checkout coupon field never calls `POST /coupons/validate` — code collected but not validated before order | 🟡 Incomplete | `checkout/page.tsx` |

## Feature Coverage

| Feature | DB | Backend | Admin Form | Admin List |
|---------|-----|---------|------------|------------|
| Code / Type / Value | ✅ | ✅ | ✅ | ✅ |
| min_order_amount | ✅ | ✅ | ✅ | ❌ |
| max_discount (cap) | ✅ | ✅ | ✅ (% only) | ❌ |
| usage_limit | ✅ | ✅ | ✅ | ✅ |
| usage_per_user | ✅ | ✅ | ✅ | ❌ |
| Date range | ✅ | ✅ | ✅ | ✅ |
| Product restrictions | ✅ | ✅ | ❌ no UI | ❌ |
| Category restrictions | ✅ | ❌ not validated | ❌ no UI | ❌ |
| used_count tracking | ✅ | ❌ never incremented | — | ✅ displayed |

## Fix Solutions

### CPN-B1 — Validate category restrictions in validate()
```ts
// coupon.repository.ts — inside validate(), after product check:
if (coupon.coupon_categories?.length > 0) {
  const allowedCategoryIds = coupon.coupon_categories.map(cc => cc.category_id);
  // Collect category_ids from order items (requires passing items to validate)
  const itemCategoryIds = items.map(item => item.variant.product.category_id);
  const hasMatch = itemCategoryIds.some(id => allowedCategoryIds.includes(id));
  if (!hasMatch) {
    throw new BadRequestError('این کد تخفیف برای دسته‌بندی‌های انتخاب‌شده معتبر نیست');
  }
}
```
Note: `validate()` currently receives `{ coupon_code, cart_items }` — ensure `category_id` is included in the cart item payload passed to this method.

### CPN-B2 — Apply percentage cap on update too
```ts
// coupon.validator.ts — add refine to updateCouponSchema:
export const updateCouponSchema = z.object({
  ...createCouponSchema.shape,
}).partial().refine(
  data => !(data.type === 'percentage' && data.value !== undefined && data.value > 100),
  { message: 'درصد تخفیف نمی‌تواند بیشتر از ۱۰۰ باشد', path: ['value'] }
);
```

### CPN-F1 — Add product/category selection UI to admin coupon form
1. Add a multi-select or searchable combobox for products (reuse the product search already used in admin product pages)
2. Add a category tree checkbox list
3. Show both fields conditionally — only when user explicitly enables "restrict to products" or "restrict to categories" toggle
4. Wire to existing `product_ids` and `category_ids` form fields

### CPN-F2 — Fix hook call syntax
```tsx
// admin/coupons/[id]/page.tsx
// BEFORE:
const { data: productsData } = useProducts?.();

// AFTER:
const { data: productsData } = useProducts();
```

### CPN-F5 — Wire coupon validation in checkout
```tsx
// checkout/page.tsx — add validate-on-apply logic:
const [couponResult, setCouponResult] = useState<CouponValidation | null>(null);

const applyCoupon = async () => {
  try {
    const result = await couponService.validate({
      coupon_code: couponCode,
      cart_items: cart.items.map(i => ({ variant_id: i.variant_id, quantity: i.quantity })),
    });
    setCouponResult(result.data);
    toast.success(`کد تخفیف اعمال شد: ${formatPrice(result.data.discount_amount)} تومان`);
  } catch (err: any) {
    toast.error(err.response?.data?.message || 'کد تخفیف نامعتبر است');
  }
};
// Pass coupon_code to createOrder only after successful validation.
```
