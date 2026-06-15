# Module: Cart

## Backend

| # | Issue | Severity | File |
|---|-------|----------|------|
| C-B1 | N+1 query in `getCartWithDetails` — separate DB query per variant in a loop | 🟠 Bug | `cart.repository.ts:53` |
| C-B2 | `updateItem` doesn't return the updated cart — inconsistent with `addItem` | 🟠 Bug | `cart.repository.ts:146` |
| C-B3 | `mergeGuestCart` saves items without `cartItemRepo.create()` — bypasses entity hooks | 🟠 Bug | `cart.repository.ts:204` |
| C-B4 | Guest carts (`session_id`) never expire or get cleaned up — accumulate indefinitely | 🟡 Incomplete | `cart.entity.ts` |
| C-B5 | No stock reservation — another user can purchase the same variant while it's in cart | 🟡 Incomplete | `cart.repository.ts` |

## Frontend

| # | Issue | Severity | File |
|---|-------|----------|------|
| C-F1 | `AddToCartButton` forces login before adding — defeats the guest cart flow; backend supports guests via `sessionId` | 🔴 Blocker | `AddToCartButton.tsx:35` |
| C-F2 | `CartDrawer` decrement has no minimum of 1 — user can set quantity to 0 | 🟠 Bug | `CartDrawer.tsx:98` |
| C-F3 | `CartDrawer` increment doesn't check `stock_quantity` — allows adding above available stock | 🟠 Bug | `CartDrawer.tsx:105` |
| C-F4 | `mergeCart()` not awaited in auth state effect — query invalidation races the merge | 🟠 Bug | `useCart.ts:32` |
| C-F5 | Cart page shows attribute value only ("قرمز") without attribute name ("رنگ: قرمز") | 🟡 Incomplete | `cart/page.tsx:73` |
| C-F6 | `CartDrawer` uses base price only — ignores `compare_at_price` / sale price | 🟡 Incomplete | `CartDrawer.tsx:112` |
| C-F7 | `total_items` vs `total_quantity` labels are confusing — needs clearer display copy | 🟡 Incomplete | `cart/page.tsx:119` |

## Fix Solutions

### C-B1 — Eliminate N+1 with a single JOIN query
```ts
// cart.repository.ts — replace the loop with a proper query:
// Use TypeORM QueryBuilder to JOIN cart_items → variants → product → images → attribute_values
// in a single query instead of calling findOne per item.
const items = await this.cartItemRepo
  .createQueryBuilder('item')
  .leftJoinAndSelect('item.variant', 'variant')
  .leftJoinAndSelect('variant.product', 'product')
  .leftJoinAndSelect('variant.images', 'variantImage')
  .leftJoinAndSelect('variant.attributeValues', 'attrVal')
  .leftJoinAndSelect('attrVal.attribute', 'attr')
  .where('item.cart_id = :cartId', { cartId: cart.id })
  .getMany();
```

### C-F1 — Allow guest add-to-cart
```tsx
// AddToCartButton.tsx — remove the login redirect gate:
// BEFORE:
if (!isAuthenticated) { router.push('/login'); return; }

// AFTER: Remove the block. The cart service already handles guests via
// the x-session-id header (sessionId from localStorage). Let the add
// proceed; the user merges on login.
// Only show login prompt for actions that truly require auth (checkout).
```

### C-F2 + C-F3 — Clamp quantity in CartDrawer
```tsx
// CartDrawer.tsx
// Decrement — clamp to minimum 1:
onClick={() => updateItem({ id: item.id, quantity: Math.max(1, item.quantity - 1) })}

// Increment — clamp to stock:
onClick={() => {
  if (item.quantity < item.variant.stock_quantity) {
    updateItem({ id: item.id, quantity: item.quantity + 1 });
  }
}}
// Disable increment button when at stock limit:
disabled={item.quantity >= item.variant.stock_quantity}
```

### C-F4 — Await mergeCart before invalidating
```ts
// useCart.ts
useEffect(() => {
  if (!isAuthenticated) return;
  const merge = async () => {
    await cartService.mergeCart();           // wait for merge to complete
    queryClient.invalidateQueries(['cart']); // then refresh
  };
  merge();
}, [isAuthenticated]);
```

### C-B4 — Add guest cart cleanup (cron or on-login)
```ts
// cart.repository.ts — add a cleanup method:
async cleanupExpiredGuestCarts(olderThanDays = 30): Promise<void> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - olderThanDays);
  await this.cartRepo
    .createQueryBuilder()
    .delete()
    .where('user_id IS NULL')
    .andWhere('updated_at < :cutoff', { cutoff })
    .execute();
}
// Call this from a scheduled job or during mergeCart cleanup.
```
