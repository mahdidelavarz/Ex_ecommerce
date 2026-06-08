# Module: Wishlist

## Status Summary

One of the better-built modules. Authentication on every route, ownership check on delete, DB uniqueness constraint, cascade delete, and full product details in the response all work correctly. The gaps are small: the Zod schema is defined but never wired as middleware, the POST response returns `null`, and the frontend heart button updates state optimistically before the mutation resolves with no rollback on failure.

---

## Backend

| # | Issue | Severity | File |
|---|-------|----------|------|
| WSH-B1 | `addToWishlistSchema` defined in `wishlist.validator.ts` but `validate` middleware never imported or applied to the `POST /` route | 🟠 Bug | `wishlist.routes.ts` |
| WSH-B2 | `POST /` response calls `ApiResponseHelper.created(res, null, ...)` — returns `null` data; client cannot get the new item's ID without a separate fetch | 🟠 Bug | `wishlist.controller.ts:15-18` |
| WSH-B3 | No pagination on `GET /` — returns all wishlist items at once; large wishlists cause oversized payloads | 🟡 Incomplete | `wishlist.repository.ts:12-44` |
| WSH-B4 | No UUID param validation on `DELETE /:id` and `GET /check/:variantId` — invalid strings reach the DB instead of returning a 400 | 🟡 Incomplete | `wishlist.routes.ts` |

## Frontend

| # | Issue | Severity | File |
|---|-------|----------|------|
| WSH-F1 | `setIsWishlisted(!isWishlisted)` called immediately before the mutation resolves — on API failure the heart icon stays in the wrong state with no rollback | 🟠 Bug | `WishlistButton.tsx:43` |
| WSH-F2 | `useRemoveFromWishlist` has no `onError` handler — removal failure is silent; `useAddToWishlist` has one but remove does not | 🟠 Bug | `useWishlist.ts:24-32` |
| WSH-F3 | No `disabled` state on WishlistButton during in-flight mutation — rapid clicks trigger multiple concurrent requests | 🟡 Incomplete | `WishlistButton.tsx` |
| WSH-F4 | No wishlist count badge in the header — cart shows `cart.total_items` badge but the wishlist link has none | 🟡 Incomplete | `components/layout/Header.tsx:60-66` |

---

## What IS Working

- All routes require `authenticate` — no unauthenticated access possible
- `remove()` filters by `user_id` in the WHERE clause — users cannot delete each other's items
- DB `@Unique('uq_user_variant', ['user_id', 'variant_id'])` — same variant cannot be added twice
- Application-level duplicate check in `add()` returns a localized error before hitting the constraint
- Variant existence validated before insertion
- `onDelete: 'CASCADE'` — wishlist items auto-removed when a variant or user is deleted
- `GET /` returns full product details (image, price, stock, attributes) — not just IDs
- `GET /check/:variantId` — single-item check endpoint exists for fast button state queries
- Frontend `WishlistButton` reads from `useWishlist()` and fills/empties heart based on server data
- Wishlist page shows product image, price, current stock status, and attribute values
- "افزودن به سبد" (move to cart) button on wishlist page with stock check
- Loading spinner and empty state on wishlist page
- `WishlistButton` placed on product detail page
- Auth redirect: unauthenticated add attempts redirect to `/login`
- React Query `invalidateQueries` called on success — list stays in sync

---

## Fix Solutions

### WSH-B1 — Wire validate middleware on POST route
```ts
// wishlist.routes.ts
import { validate } from '../../middleware/validate';
import { addToWishlistSchema } from './wishlist.validator';

// BEFORE:
router.post('/', authenticate, controller.add);

// AFTER:
router.post('/', authenticate, validate({ body: addToWishlistSchema }), asyncHandler(controller.add));
```
Also wrap the other handlers with `asyncHandler` for consistency.

---

### WSH-B2 — Return created item from POST
```ts
// wishlist.controller.ts
async add(req: Request, res: Response) {
  const item = await this.service.add(req.userId!, req.body.variant_id);
  return ApiResponseHelper.created(res, item, 'به علاقه‌مندی‌ها اضافه شد');
}
```
`wishlist.service.add()` already calls `wishlist.repository.add()` which returns the saved entity — just pass it through.

---

### WSH-B3 — Add pagination to GET /
```ts
// wishlist.repository.ts — findByUser():
async findByUser(userId: string, page = 1, limit = 20) {
  const [items, total] = await this.repo.findAndCount({
    where: { user_id: userId },
    relations: { variant: { product: { images: true }, variant_attribute_values: { attribute_value: { attribute: true } } } },
    order: { created_at: 'DESC' },
    skip: (page - 1) * limit,
    take: limit,
  });
  return { items, total, page, limit };
}

// wishlist.controller.ts — pass query params:
const page  = parseInt(req.query.page  as string) || 1;
const limit = parseInt(req.query.limit as string) || 20;
const result = await this.service.getWishlist(req.userId!, page, limit);
return ApiResponseHelper.paginated(res, result.items, result.total, page, limit);
```

---

### WSH-F1 — Move state update inside onSuccess (no optimistic update)
```tsx
// WishlistButton.tsx
const addToWishlist    = useAddToWishlist();
const removeFromWishlist = useRemoveFromWishlist();

const isPending = addToWishlist.isPending || removeFromWishlist.isPending;

const handleToggle = () => {
  if (isPending) return;
  if (isWishlisted) {
    const item = wishlist?.find(i => i.variant_id === variantId);
    if (item) removeFromWishlist.mutate(item.id);
    // do NOT call setIsWishlisted here — let onSuccess do it
  } else {
    addToWishlist.mutate(variantId);
  }
};
```
With React Query, `onSuccess` re-fetches the wishlist via `invalidateQueries`, so `isWishlisted` will update automatically from the server response — no local state needed.

---

### WSH-F2 — Add onError to remove mutation
```ts
// useWishlist.ts — useRemoveFromWishlist:
export const useRemoveFromWishlist = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => wishlistService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success('از علاقه‌مندی‌ها حذف شد');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'خطا در حذف از علاقه‌مندی‌ها'),
  });
};
```

---

### WSH-F3 — Disable button during mutation
```tsx
// WishlistButton.tsx
<button
  onClick={handleToggle}
  disabled={isPending}
  className={clsx(
    'transition-colors',
    isPending && 'opacity-50 cursor-not-allowed',
  )}
  aria-label={isWishlisted ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'}
>
  {isWishlisted
    ? <MdiHeart className="w-5 h-5 text-red-500" />
    : <MdiHeartOutline className="w-5 h-5" />
  }
</button>
```

---

### WSH-F4 — Add count badge to header wishlist link
```tsx
// components/layout/Header.tsx
const { data: wishlist } = useWishlist();
const wishlistCount = wishlist?.data?.items?.length ?? 0;

<Link href="/wishlist" className="relative">
  <MdiHeartOutline className="w-6 h-6" />
  {wishlistCount > 0 && (
    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs
                     w-4 h-4 rounded-full flex items-center justify-center">
      {wishlistCount > 99 ? '99+' : wishlistCount}
    </span>
  )}
</Link>
```
