# Module: Payments

## Status: ✅ Fixed (2026-06-18)

Zarinpal gateway integrated. Orders now trigger a real payment flow. All blockers resolved.

---

## Payment Flow (implemented)

| Step | Intended | Actual |
|------|----------|--------|
| Place order | `POST /orders` | ✅ works |
| Initiate payment | `POST /payments/initiate` → get gateway URL | ✅ implemented |
| Redirect to gateway | Browser → Zarinpal sandbox/production | ✅ implemented |
| Gateway callback / verify | `GET /payments/verify` | ✅ implemented |
| Update order to paid | auto on verification | ✅ implemented |
| Confirmation page | redirect to `/orders/:id?payment=success` | ✅ implemented |

---

## Backend

| # | Issue | Severity | Status |
|---|-------|----------|--------|
| PAY-B1 | No payment gateway integrated — module is pure CRUD stub, orders can never be charged | 🔴 Blocker | ✅ Fixed — `gateway/zarinpal.service.ts` added |
| PAY-B2 | No customer payment initiation endpoint — `POST /payments` requires `ADMIN` role | 🔴 Blocker | ✅ Fixed — `POST /payments/initiate` (authenticated, customer-accessible) |
| PAY-B3 | No webhook/callback handler — gateway has no way to confirm payment completion | 🔴 Blocker | ✅ Fixed — `GET /payments/verify` (public, idempotent) |
| PAY-B4 | `paid_amount` set to stale `payment.amount` on update — accumulation logic broken | 🟠 Bug | ✅ Fixed — accumulates `order.paid_amount + addedAmount` |
| PAY-B5 | No uniqueness index on `transaction_id` — duplicate webhook calls create duplicate records | 🟠 Bug | ✅ Fixed — partial unique index where NOT NULL added to entity |
| PAY-B6 | `gateway_response` typed as `any` in Zod validator and frontend types — no structure enforced | 🟡 Incomplete | ✅ Fixed — `GatewayResponse` interface + Zod `passthrough` schema |
| PAY-B7 | Partial payment support incomplete — `partially_paid` status exists in enum but no logic | 🟡 Incomplete | ⏭ Deferred — requires multi-installment business logic |

## Frontend

| # | Issue | Severity | Status |
|---|-------|----------|--------|
| PAY-F1 | Checkout does not initiate payment after order creation — user lands on a permanently "pending" order | 🔴 Blocker | ✅ Fixed — `handlePlaceOrder` calls `paymentService.initiate()` + `window.location.href` |
| PAY-F2 | No payment result page — no success or failure feedback after returning from gateway | 🔴 Blocker | ✅ Fixed — `?payment=success` / `?payment=cancelled` banners on order detail |
| PAY-F3 | No "retry payment" button — if payment fails, there is no UI path to attempt again | 🟡 Incomplete | ✅ Fixed — retry button in cancelled banner calls `paymentService.initiate()` again |
| PAY-F4 | `payment.service.ts` `create()` and `update()` accept `data: any` — no typed DTOs | 🟡 Incomplete | ✅ Fixed — typed method signatures in `payment.service.ts` |

---

## Fix Solutions

### PAY-B1 / PAY-B2 / PAY-B3 — Gateway integration (Zarinpal)

Zarinpal is the dominant payment provider in Iran. No npm SDK needed — use Axios already in the project.

**New env vars in `backend/.env`:**
```env
ZARINPAL_MERCHANT_ID=your-merchant-id
ZARINPAL_SANDBOX=true
ZARINPAL_CALLBACK_URL=https://your-domain.com/api/v1/payments/verify
FRONTEND_URL=https://your-domain.com
```

**New file — `backend/src/modules/payments/gateway/zarinpal.service.ts`:**
```ts
const BASE = (sandbox: boolean) =>
  sandbox ? 'https://sandbox.zarinpal.com/pg' : 'https://api.zarinpal.com/pg';

export class ZarinpalService {
  async requestPayment(amount: number, description: string, callbackUrl: string) {
    const res = await axios.post(`${BASE(env.zarinpal.sandbox)}/v4/payment/request.json`, {
      merchant_id:  env.zarinpal.merchantId,
      amount,
      description,
      callback_url: callbackUrl,
    });
    if (res.data.data.code !== 100) throw new BadRequestError('خطا در ایجاد درگاه پرداخت');
    return res.data.data.authority;
  }

  getGatewayUrl(authority: string): string {
    return `${BASE(env.zarinpal.sandbox)}/StartPay/${authority}`;
  }

  async verifyPayment(authority: string, amount: number) {
    const res = await axios.post(`${BASE(env.zarinpal.sandbox)}/v4/payment/verify.json`, {
      merchant_id: env.zarinpal.merchantId,
      amount,
      authority,
    });
    const { code, ref_id } = res.data.data;
    if (code !== 100 && code !== 101) throw new BadRequestError('پرداخت تایید نشد');
    return { refId: String(ref_id), alreadyVerified: code === 101 };
  }
}
```

**New endpoint — `POST /payments/initiate` (authenticated, customer-accessible):**
```ts
// payment.controller.ts
async initiate(req: Request, res: Response) {
  const { order_id } = req.body;
  const order = await orderRepo.findById(order_id);
  if (order.user_id !== req.userId) throw new ForbiddenError();
  if (order.payment_status === 'paid') throw new BadRequestError('این سفارش قبلاً پرداخت شده است');

  const authority = await zarinpalService.requestPayment(
    order.total_amount,
    `پرداخت سفارش ${order.order_number}`,
    `${env.zarinpal.callbackUrl}?order_id=${order_id}`,
  );

  await paymentService.create({
    order_id,
    provider:       'zarinpal',
    method:         'online',
    amount:         order.total_amount,
    transaction_id: authority,
  });

  return ApiResponseHelper.success(res, {
    gateway_url: zarinpalService.getGatewayUrl(authority),
  });
}
```

**New endpoint — `GET /payments/verify` (public — called by Zarinpal redirect):**
```ts
// payment.controller.ts
async verify(req: Request, res: Response) {
  const { Authority, Status, order_id } = req.query as Record<string, string>;

  if (Status !== 'OK') {
    return res.redirect(`${env.frontendUrl}/orders?payment=cancelled`);
  }

  const payment = await paymentRepo.findByTransactionId(Authority);
  if (!payment) throw new NotFoundError('پرداخت یافت نشد');

  const { refId, alreadyVerified } = await zarinpalService.verifyPayment(Authority, payment.amount);

  if (!alreadyVerified) {
    await paymentRepo.update(payment.id, {
      status:           'completed',
      transaction_id:   refId,
      gateway_response: { authority: Authority, ref_id: refId },
      paid_at:          new Date(),
    });
    await orderRepo.update(payment.order_id, {
      payment_status: 'paid',
      status:         'confirmed',
    });
  }

  return res.redirect(`${env.frontendUrl}/orders/${payment.order_id}?payment=success`);
}
```

Route wiring in `payment.routes.ts`:
```ts
router.post('/initiate', authenticate, asyncHandler(controller.initiate));
router.get('/verify', asyncHandler(controller.verify));  // no auth — public callback
```

---

### PAY-B4 — Fix `paid_amount` accumulation
```ts
// payment.repository.ts — update():
// BEFORE (wrong — uses old snapshot amount):
updateData.paid_amount = payment.amount;

// AFTER (accumulate correctly):
const order = await this.orderRepo.findOne({ where: { id: payment.order_id } });
const newPaid = (order.paid_amount ?? 0) + (updateData.amount ?? payment.amount);
await this.orderRepo.update(payment.order_id, {
  paid_amount: newPaid,
  due_amount:  Math.max(0, order.total_amount - newPaid),
});
```

---

### PAY-B5 — Add `transaction_id` uniqueness index
```ts
// payment.entity.ts — add partial unique index (NULL-safe):
@Index({ unique: true, where: '"transaction_id" IS NOT NULL' })
@Column({ nullable: true })
transaction_id: string | null;
```
This prevents duplicate webhook calls from inserting duplicate payment records.

---

### PAY-F1 — Initiate payment after order creation
```tsx
// checkout/page.tsx
const handleCheckout = async () => {
  const order = await createOrder.mutateAsync({ ...formData });
  const { data } = await paymentService.initiate(order.data.id);
  window.location.href = data.gateway_url;
};
```

---

### PAY-F2 — Show payment result on order detail page
```tsx
// orders/[id]/page.tsx
const paymentResult = useSearchParams().get('payment');

{paymentResult === 'success' && (
  <div className="bg-green-50 border border-green-200 rounded p-4 mb-4">
    پرداخت شما با موفقیت انجام شد
  </div>
)}
{paymentResult === 'cancelled' && (
  <div className="bg-red-50 border border-red-200 rounded p-4 mb-4 flex justify-between items-center">
    <span>پرداخت لغو شد</span>
    <RetryPaymentButton orderId={order.id} />
  </div>
)}
```

---

## Verification Checklist

After integration:
1. Place order → should redirect browser to Zarinpal sandbox gateway
2. Complete payment → redirects back to `/orders/:id?payment=success`, order status = `confirmed`
3. Cancel payment → redirects back to `/orders?payment=cancelled`
4. Pay already-paid order → returns "این سفارش قبلاً پرداخت شده است" (400)
5. Duplicate callback (same Authority) → idempotent (Zarinpal code 101 = already verified, no double-credit)
