# Module: Cart

## Backend

| # | Issue | Severity | File | Status |
|---|-------|----------|------|--------|
| C-B1 | ~~N+1 query in `getCartWithDetails` — separate DB query per variant in a loop~~ — ✅ Fixed: replaced loop with QueryBuilder JOIN across cart_items → variant → product → images → attribute_values | 🟠 Bug | `cart.repository.ts` | ✅ Fixed |
| C-B2 | ~~`updateItem` doesn't return the updated cart — inconsistent with `addItem`~~ — ✅ Fixed: service now calls `getCartWithDetails` after save and returns the full cart | 🟠 Bug | `cart.service.ts` | ✅ Fixed |
| C-B3 | ~~`mergeGuestCart` saves items without `cartItemRepo.create()` — bypasses entity hooks~~ — ✅ Fixed: now uses `cartItemRepo.create()` before `save()` | 🟠 Bug | `cart.repository.ts` | ✅ Fixed |
| C-B4 | ~~Guest carts (`session_id`) never expire or get cleaned up~~ — ✅ Fixed: added `cleanupExpiredGuestCarts(olderThanDays = 30)` method; call from a scheduled job | 🟡 Incomplete | `cart.repository.ts` | ✅ Fixed |
| C-B5 | No stock reservation — another user can purchase the same variant while it's in cart | 🟡 Incomplete | `cart.repository.ts` | ⏭ Deferred |

## Frontend

| # | Issue | Severity | File | Status |
|---|-------|----------|------|--------|
| C-F1 | ~~`AddToCartButton` forces login before adding — defeats the guest cart flow~~ — ✅ Fixed: removed login redirect; guests add freely and merge on login | 🔴 Blocker | `AddToCartButton.tsx` | ✅ Fixed |
| C-F2 | ~~`CartDrawer` decrement has no minimum of 1~~ — ✅ Already implemented: `Math.max(1, item.quantity - 1)` was already in place | 🟠 Bug | `CartDrawer.tsx` | ✅ Fixed |
| C-F3 | ~~`CartDrawer` increment doesn't check `stock_quantity`~~ — ✅ Already implemented: `Math.min(stock_quantity, ...)` + `disabled` were already in place | 🟠 Bug | `CartDrawer.tsx` | ✅ Fixed |
| C-F4 | ~~`mergeCart()` not awaited in auth state effect~~ — ✅ Fixed: refactored to inner `async` function with `await` before `invalidateQueries` | 🟠 Bug | `useCart.ts` | ✅ Fixed |
| C-F5 | ~~Cart shows attribute value only ("قرمز") without attribute name ("رنگ: قرمز")~~ — ✅ Fixed: both CartDrawer and cart/page.tsx now render `attr.name: attr.value` | 🟡 Incomplete | `CartDrawer.tsx`, `cart/page.tsx` | ✅ Fixed |
| C-F6 | ~~`CartDrawer` uses base price only — ignores `compare_at_price`~~ — ✅ Fixed: both CartDrawer and cart/page.tsx show strikethrough `compare_at_price` when it exceeds the sale price | 🟡 Incomplete | `CartDrawer.tsx`, `cart/page.tsx` | ✅ Fixed |
| C-F7 | ~~`total_items` vs `total_quantity` labels confusing~~ — ✅ Fixed: labels now read "تعداد محصولات مختلف" (unique variants) and "تعداد واحد" (total units) | 🟡 Incomplete | `cart/page.tsx` | ✅ Fixed |

## Deferred / Out of Scope

| # | Issue | Notes |
|---|-------|-------|
| C-B5 | Stock reservation | Requires pessimistic locking or a reservation table; deferred to order-flow hardening |

## Fix Solutions (applied)

### C-B1 — Single QueryBuilder JOIN (applied in `cart.repository.ts`)
```ts
const items = await this.cartItemRepo
  .createQueryBuilder('item')
  .leftJoinAndSelect('item.variant', 'variant')
  .leftJoinAndSelect('variant.product', 'product')
  .leftJoinAndSelect('variant.images', 'images')
  .leftJoinAndSelect('variant.variant_attribute_values', 'vav')
  .leftJoinAndSelect('vav.attribute_value', 'attrVal')
  .leftJoinAndSelect('attrVal.attribute', 'attr')
  .where('item.cart_id = :cartId', { cartId })
  .getMany();
```

### C-B2 — updateItem returns full cart (applied in `cart.service.ts`)
```ts
async updateItem(itemId: string, dto: UpdateCartItemDto) {
  const item = await this.repo.updateItem(itemId, dto);
  return this.repo.getCartWithDetails(item.cart_id);
}
```

### C-B3 — mergeGuestCart uses create() (applied in `cart.repository.ts`)
```ts
await this.cartItemRepo.save(
  this.cartItemRepo.create({ cart_id: userCart.id, variant_id: guestItem.variant_id, quantity: guestItem.quantity })
);
```

### C-B4 — cleanupExpiredGuestCarts (applied in `cart.repository.ts`)
```ts
async cleanupExpiredGuestCarts(olderThanDays = 30): Promise<void> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - olderThanDays);
  await this.cartRepo.createQueryBuilder().delete()
    .where('user_id IS NULL').andWhere('updated_at < :cutoff', { cutoff }).execute();
}
```

### C-F4 — async merge before invalidate (applied in `useCart.ts`)
```ts
useEffect(() => {
  if (!isAuthenticated) return;
  const merge = async () => {
    await cartService.mergeCart();
    queryClient.invalidateQueries({ queryKey: ['cart'] });
  };
  merge();
}, [isAuthenticated, queryClient]);
```
