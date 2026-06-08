# Module: Orders

## Backend

| # | Issue | Severity | File |
|---|-------|----------|------|
| O-B1 | Admin route `GET /admin/all` defined **after** `/:id` — Express matches `/:id` first, `/admin/all` is **unreachable** | 🔴 Blocker | `order.routes.ts` |
| O-B2 | Coupon applied without checking: usage_limit, per-user limit, min purchase amount, or product/category restrictions | 🟠 Bug | `order.repository.ts:115` |
| O-B3 | Coupon `used_count` never incremented after a successful order | 🟠 Bug | `order.repository.ts` |
| O-B4 | `findAllAdmin` uses `groupBy` without aggregated columns — fails or returns wrong results in strict SQL mode | 🟠 Bug | `order.repository.ts` |
| O-B5 | `order_items.variant_title` stores `variant.sku` instead of a human-readable title | 🟡 Incomplete | `order.repository.ts:93` |
| O-B6 | No payment gateway call after order creation — order created with `payment_status: pending`, no charge happens | 🟡 Incomplete | `order.repository.ts` |

## Frontend

| # | Issue | Severity | File |
|---|-------|----------|------|
| O-F1 | Checkout sends hardcoded `shipping_address_id: 'temp-address-id'` — backend rejects it | 🔴 Blocker | `checkout/page.tsx:29` |
| O-F2 | No address selection UI — user cannot pick from their saved addresses | 🔴 Blocker | `checkout/page.tsx` |
| O-F3 | No post-order redirect or confirmation page — user sees nothing after placing an order | 🟡 Incomplete | `checkout/page.tsx` |
| O-F4 | No coupon feedback — code collected but no API call to validate or preview discount | 🟡 Incomplete | `checkout/page.tsx` |
| O-F5 | Orders list has no pagination controls — page state tracked but no next/prev buttons | 🟡 Incomplete | `orders/page.tsx` |
| O-F6 | Orders list has no status filter — backend supports it, frontend doesn't expose it | 🟡 Incomplete | `orders/page.tsx` |
| O-F7 | Cancel confirmation uses `window.confirm()` — not styled with app UI | 🟡 Incomplete | `orders/[id]/page.tsx` |
| O-F8 | Missing hooks `useAdminOrders` and `useUpdateOrderStatus` | 🟡 Incomplete | `useOrders.ts` |

## Fix Solutions

### O-B1 — Fix admin route ordering
```ts
// order.routes.ts — move admin routes BEFORE /:id
// BEFORE (broken):
router.get('/:id', authenticate, controller.getById);
router.get('/admin/all', authenticate, authorize(UserRole.ADMIN), controller.adminList);

// AFTER (correct):
router.get('/admin/all', authenticate, authorize(UserRole.ADMIN), controller.adminList);
router.get('/:id', authenticate, controller.getById);
```

### O-B2 + O-B3 — Enforce coupon rules and increment used_count
```ts
// order.repository.ts — inside createOrder transaction, after coupon validation:

// 1. Check usage_limit
if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
  throw new BadRequestError('کد تخفیف به حداکثر استفاده رسیده است');
}

// 2. Check per-user limit
if (coupon.usage_per_user) {
  const userUsage = await this.orderRepo.count({
    where: { user_id: userId, coupon_id: coupon.id },
  });
  if (userUsage >= coupon.usage_per_user) {
    throw new BadRequestError('شما قبلاً از این کد تخفیف استفاده کرده‌اید');
  }
}

// 3. Increment used_count after saving order (inside same transaction):
await queryRunner.manager.increment(Coupon, { id: coupon.id }, 'used_count', 1);
```

### O-F1 + O-F2 — Real address selection in checkout
1. Fetch user addresses on checkout mount: `useQuery(['addresses'], addressService.list)`
2. Render a radio-group or select of saved addresses
3. Allow adding a new address inline (modal or inline form)
4. Replace `useState('temp-address-id')` with `useState(addresses[0]?.id ?? '')`
5. Disable "Place Order" button until an address is selected

### O-F3 — Order confirmation redirect
```tsx
// checkout/page.tsx — in useCreateOrder onSuccess:
onSuccess: (data) => {
  router.push(`/orders/${data.data.id}?success=true`);
}

// orders/[id]/page.tsx — show success banner if ?success=true in searchParams
```
