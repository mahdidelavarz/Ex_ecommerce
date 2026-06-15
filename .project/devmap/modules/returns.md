# Module: Returns

## Status Summary

Backend has structure (entity, repository, routes) but bypasses the service/controller pattern, lacks input validation, transactions, and business-rule enforcement. Frontend has a working admin panel but the customer-facing return form is non-functional (item selection is wired to state that is never populated).

Estimated completeness: ~40%.

---

## Backend

| # | Issue | Severity | File |
|---|-------|----------|------|
| RET-B1 | No `return.validator.ts` — `POST /` and `PATCH /:id/status` have no Zod validation | 🔴 Blocker | `return.routes.ts` |
| RET-B2 | Routes call `ReturnRepository` directly — no controller, no service layer | 🟠 Bug | `return.routes.ts:8` |
| RET-B3 | No `asyncHandler` wrapper on any route — unhandled promise rejections skip global error handler | 🟠 Bug | `return.routes.ts:10-39` |
| RET-B4 | No DB transaction on return creation — item save loop failure leaves a return record with no items | 🟠 Bug | `return.repository.ts:14-42` |
| RET-B5 | Race condition on return number generation — `count() + 1` pattern duplicates under concurrent load | 🟠 Bug | `return.repository.ts:18-19` |
| RET-B6 | No business-rule validation on create: order doesn't need to be `delivered`, no return window enforced, item quantities not checked against order | 🔴 Blocker | `return.repository.ts:14-16` |
| RET-B7 | Refund amount not validated on status update — admin can enter any number; no check against original order total | 🟠 Bug | `return.repository.ts:79` |
| RET-B8 | No customer-facing `GET /:id` route — customers can only list their returns, not view detail by ID | 🟡 Incomplete | `return.routes.ts:31-33` |
| RET-B9 | `findByUser()` has no pagination — returns all records at once | 🟡 Incomplete | `return.repository.ts:44-46` |
| RET-B10 | Status transitions are unconstrained — no state machine, admin can jump from `pending` to `refunded` skipping `received` | 🟡 Incomplete | `return.repository.ts:68-89` |
| RET-B11 | `ReturnStatus` enum defined but routes use `'pending' as any` string cast — TypeScript protection bypassed | 🟡 Incomplete | `return.routes.ts:26` |

## Frontend

| # | Issue | Severity | File |
|---|-------|----------|------|
| RET-F1 | Customer return form has no item selection UI — `selectedItems` state is declared but nothing populates it; submitted returns always have 0 items | 🔴 Blocker | `returns/page.tsx:43-86` |
| RET-F2 | No customer detail page — `returns/[id]/page.tsx` does not exist; customers cannot view return status, items, admin notes, or refund amount | 🔴 Blocker | `frontend/src/app/returns/` |
| RET-F3 | Status color mapping is wrong — `pending`, `received`, and `refunded` all fall into default warning color; only `approved` and `rejected` are mapped | 🟠 Bug | `returns/page.tsx:103-107` |
| RET-F4 | Admin refund input uses browser `prompt()` — no validation, no decimal handling, poor UX | 🟠 Bug | `admin/returns/page.tsx:163-164` |
| RET-F5 | Admin status update buttons have no loading/disabled state — allows double-click duplicate requests | 🟠 Bug | `admin/returns/page.tsx:49-57` |
| RET-F6 | No state machine enforcement in admin UI — "بازگشت وجه" (refund) button visible before "دریافت شد" (received) is confirmed | 🟡 Incomplete | `admin/returns/page.tsx:153-170` |
| RET-F7 | No customer return cancel or edit — once filed, customer cannot correct a wrong reason or cancel the request | 🟡 Incomplete | `returns/page.tsx` |
| RET-F8 | No return window warning in form — filter shows `shipped` + `delivered` orders regardless of delivery date | 🟡 Incomplete | `returns/page.tsx:71` |

---

## What IS Working

- `ReturnStatus` enum with 5 states: `pending → approved/rejected → received → refunded`
- `authenticate` + `authorize(ADMIN)` correctly applied — customers cannot access admin routes
- Ownership check on create: `user_id` is taken from JWT, not from request body
- Relations loaded on all queries (`order`, `user`, `items`)
- Admin panel: list, filter by status, detail view, status action buttons — all functional
- Customer list view renders correctly
- React Query patterns used correctly in frontend (useQuery, useMutation, invalidateQueries)

---

## Fix Solutions

### RET-B1 — Add Zod validators
Create `backend/src/modules/returns/return.validator.ts`:
```ts
import { z } from 'zod';

export const createReturnSchema = z.object({
  order_id: z.string().uuid({ message: 'شناسه سفارش نامعتبر است' }),
  reason:   z.string().min(10, 'دلیل بازگشت باید حداقل ۱۰ کاراکتر باشد').max(500),
  items: z.array(z.object({
    order_item_id: z.string().uuid(),
    quantity:      z.number().int().min(1, 'تعداد باید حداقل ۱ باشد'),
  })).min(1, 'حداقل یک آیتم الزامی است'),
});

export const updateReturnStatusSchema = z.object({
  status:        z.enum(['approved', 'rejected', 'received', 'refunded']),
  admin_notes:   z.string().max(500).optional(),
  refund_amount: z.number().nonnegative().optional(),
});
```
Wire in routes:
```ts
import { validate } from '../../middleware/validate';
import { createReturnSchema, updateReturnStatusSchema } from './return.validator';

router.post('/', authenticate, validate({ body: createReturnSchema }), asyncHandler(controller.create));
router.patch('/:id/status', authenticate, authorize(UserRole.ADMIN),
  validate({ body: updateReturnStatusSchema }), asyncHandler(controller.updateStatus));
```

---

### RET-B2 / RET-B3 — Add controller layer + asyncHandler
Introduce `return.controller.ts` and `return.service.ts` following the standard pattern:
```
return.routes.ts → return.controller.ts → return.service.ts → return.repository.ts
```
Move route handler logic into controller methods wrapped with `asyncHandler`:
```ts
// return.controller.ts
export class ReturnController {
  create = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.returnService.create(req.userId!, req.body);
    return ApiResponseHelper.created(res, result);
  });
  // ... etc
}
```

---

### RET-B4 — Wrap create in a transaction
```ts
// return.repository.ts — create():
const queryRunner = AppDataSource.createQueryRunner();
await queryRunner.connect();
await queryRunner.startTransaction();
try {
  const ret = queryRunner.manager.create(Return, {
    user_id: userId, order_id: dto.order_id,
    reason: dto.reason, status: ReturnStatus.PENDING, refund_amount: 0,
    return_number: returnNumber,
  });
  await queryRunner.manager.save(ret);

  for (const item of dto.items) {
    const returnItem = queryRunner.manager.create(ReturnItem, {
      return_id: ret.id, ...item,
    });
    await queryRunner.manager.save(returnItem);
  }

  await queryRunner.commitTransaction();
  return ret;
} catch (err) {
  await queryRunner.rollbackTransaction();
  throw err;
} finally {
  await queryRunner.release();
}
```

---

### RET-B5 — Fix return number race condition
Use a DB sequence or timestamp+random suffix instead of `count() + 1`:
```ts
const year = new Date().getFullYear();
const random = Math.floor(Math.random() * 9000) + 1000;  // 4-digit
const returnNumber = `RET-${year}-${Date.now()}-${random}`;
```
Or use a PostgreSQL sequence (`CREATE SEQUENCE return_number_seq`) via raw query for full safety.

---

### RET-B6 — Enforce business rules on create
```ts
// return.service.ts (new) — before calling repository:
const order = await orderRepo.findOne({ where: { id: dto.order_id, user_id: userId } });
if (!order) throw new NotFoundError('سفارش یافت نشد');
if (order.status !== OrderStatus.DELIVERED) throw new BadRequestError('فقط سفارش‌های تحویل‌شده قابل مرجوعی هستند');

// Return window (configurable — e.g., 14 days):
const RETURN_WINDOW_DAYS = 14;
const deliveredAt = order.delivered_at ?? order.updated_at;
const daysSinceDelivery = (Date.now() - deliveredAt.getTime()) / 86_400_000;
if (daysSinceDelivery > RETURN_WINDOW_DAYS)
  throw new BadRequestError(`مهلت مرجوعی ${RETURN_WINDOW_DAYS} روز از تاریخ تحویل است`);

// Validate items belong to this order:
for (const item of dto.items) {
  const orderItem = order.items.find(i => i.id === item.order_item_id);
  if (!orderItem) throw new BadRequestError('آیتم درخواستی در این سفارش موجود نیست');
  if (item.quantity > orderItem.quantity) throw new BadRequestError('تعداد مرجوعی بیشتر از تعداد سفارش است');
}
```

---

### RET-B7 — Validate refund amount
```ts
// return.service.ts — updateStatus():
if (dto.status === 'refunded') {
  const order = await orderRepo.findOne({ where: { id: ret.order_id } });
  if ((dto.refund_amount ?? 0) > order.total_amount)
    throw new BadRequestError('مبلغ بازگشتی نمی‌تواند از مبلغ سفارش بیشتر باشد');
  if (!dto.refund_amount)
    throw new BadRequestError('مبلغ بازگشتی الزامی است');
}
```

---

### RET-B10 — Enforce status transitions
```ts
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  pending:  ['approved', 'rejected'],
  approved: ['received', 'rejected'],
  received: ['refunded'],
  rejected: [],
  refunded: [],
};

const allowed = ALLOWED_TRANSITIONS[ret.status] ?? [];
if (!allowed.includes(dto.status))
  throw new BadRequestError(`تغییر وضعیت از ${ret.status} به ${dto.status} مجاز نیست`);
```

---

### RET-F1 — Add item selection UI to customer return form
When user selects an order, fetch its items and show checkboxes + quantity inputs:
```tsx
// returns/page.tsx
const { data: orderItems } = useQuery({
  queryKey: ['order-items', selectedOrder],
  queryFn: () => orderService.getById(selectedOrder!),
  enabled: !!selectedOrder,
  select: res => res.data.items,
});

{orderItems?.map(item => (
  <div key={item.id} className="flex items-center justify-between py-2 border-b">
    <span>{item.product_name} - {item.variant_title}</span>
    <input
      type="number"
      min={0}
      max={item.quantity}
      className="w-16 border rounded px-2"
      value={selectedItems[item.id] ?? 0}
      onChange={e => setSelectedItems(prev => ({
        ...prev,
        [item.id]: Math.min(parseInt(e.target.value) || 0, item.quantity),
      }))}
    />
  </div>
))}
```

---

### RET-F2 — Create customer return detail page
Create `frontend/src/app/returns/[id]/page.tsx`:
```tsx
export default function ReturnDetailPage({ params }: { params: { id: string } }) {
  const { data, isLoading } = useReturnById(params.id);
  if (isLoading) return <LoadingSpinner />;
  if (!data) return <NotFound />;
  const ret = data.data;

  return (
    <div dir="rtl">
      <h1>جزئیات مرجوعی {ret.return_number}</h1>
      <ReturnStatusBadge status={ret.status} />
      <p>دلیل: {ret.reason}</p>
      {ret.admin_notes && <p>یادداشت ادمین: {ret.admin_notes}</p>}
      {ret.refund_amount > 0 && <p>مبلغ بازگشتی: {ret.refund_amount.toLocaleString('fa-IR')} تومان</p>}
      <ul>{ret.items.map(item => (
        <li key={item.id}>{item.product_name} × {item.quantity}</li>
      ))}</ul>
    </div>
  );
}
```
Also add `useReturnById` hook in returns hooks file.

---

### RET-F3 — Fix status color mapping
```tsx
// returns/page.tsx
const statusConfig: Record<string, { label: string; className: string }> = {
  pending:  { label: 'در انتظار بررسی', className: 'bg-warning-light text-warning' },
  approved: { label: 'تایید شده',       className: 'bg-success-light text-success' },
  rejected: { label: 'رد شده',          className: 'bg-error-light text-error' },
  received: { label: 'دریافت شد',       className: 'bg-blue-100 text-blue-700' },
  refunded: { label: 'وجه بازگشت یافت', className: 'bg-success-light text-success' },
};

<span className={`px-2 py-1 rounded text-sm ${statusConfig[ret.status]?.className}`}>
  {statusConfig[ret.status]?.label ?? ret.status}
</span>
```

---

### RET-F4 — Replace prompt() with inline amount input
```tsx
// admin/returns/page.tsx — add state for refund input:
const [refundAmount, setRefundAmount] = useState<Record<string, string>>({});

// Replace the prompt() line:
<div className="flex items-center gap-2">
  <input
    type="number"
    placeholder="مبلغ (تومان)"
    className="border rounded px-2 py-1 w-32 text-sm"
    value={refundAmount[ret.id] ?? ''}
    onChange={e => setRefundAmount(prev => ({ ...prev, [ret.id]: e.target.value }))}
  />
  <button
    onClick={() => {
      const amount = parseInt(refundAmount[ret.id]);
      if (!amount || amount <= 0) { toast.error('مبلغ معتبر وارد کنید'); return; }
      updateStatus(ret.id, 'refunded', amount);
    }}
    disabled={isPending}
  >
    بازگشت وجه
  </button>
</div>
```
