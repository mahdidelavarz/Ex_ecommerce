# Module: Shipments

## Status: ✅ Fixed (2026-06-18)

## Backend

| # | Issue | Severity | Status |
|---|-------|----------|--------|
| SHP-B1 | `GET /order/:orderId` and `GET /:id` have no ownership check | 🔴 Blocker | ✅ Fixed — controller passes `userId` (skipped for admins); repo throws `ForbiddenError` |
| SHP-B2 | Status sync error: `in_transit` → `order_status: shipped` (wrong) | 🟠 Bug | ✅ Fixed — only `shipped/delivered/returned` mapped; `in_transit/out_for_delivery` ignored |
| SHP-B3 | Fulfillment always `partially_fulfilled` regardless of coverage | 🟠 Bug | ✅ Fixed — set `PARTIALLY_FULFILLED` on create; set `FULFILLED` when shipment `delivered` |
| SHP-B4 | No transaction — inconsistent data if order update fails | 🟠 Bug | ✅ Fixed — `create()` uses `QueryRunner` with rollback on error |
| SHP-B5 | No Zod validator on POST/PATCH | 🟠 Bug | ✅ Fixed — `shipment.validator.ts` created, wired in routes |
| SHP-B6 | `as any` casts bypass TypeScript enum safety | 🟡 Incomplete | ✅ Fixed — `ShipmentStatus`/`FulfillmentStatus`/`OrderStatus` enums used directly |
| SHP-B7 | No pagination on `findByOrder` | 🟡 Incomplete | ⏭ Deferred — low priority, orders rarely have many shipments |

## Frontend

| # | Issue | Severity | Status |
|---|-------|----------|--------|
| SHP-F1 | `ShipmentTimeline` returns `null` silently for empty | 🟠 Bug | ✅ Fixed — shows "هنوز اطلاعات ارسالی ثبت نشده است" |
| SHP-F2 | `useUpdateShipment` invalidates `['shipments']` globally | 🟠 Bug | ✅ Fixed — `orderId` added to mutation variables; invalidates `['shipments', orderId]` |
| SHP-F3 | No loading state in timeline fetch | 🟡 Incomplete | ✅ Fixed — `shipmentsLoading` handled in order detail page |
| SHP-F4 | Shipments section hidden for pending orders | 🟡 Incomplete | ✅ Fixed — section always shown; empty state via `ShipmentTimeline` |
| SHP-F5 | `data: any` in `useUpdateShipment` mutation | 🟡 Incomplete | ✅ Fixed — `UpdateShipmentDto` type added and used in hook + service |

## Fix Solutions

### SHP-B1 — Add ownership check to GET endpoints
```ts
// shipment.routes.ts — for customer-facing routes, verify order belongs to user:
router.get('/order/:orderId', authenticate, asyncHandler(async (req, res) => {
  // Option A: pass userId to repository and filter there
  const shipments = await shipmentService.findByOrder(req.params.orderId, req.userId);
  return ApiResponseHelper.success(res, shipments);
}));

// shipment.repository.ts — findByOrder with ownership check:
async findByOrder(orderId: string, userId?: string) {
  const order = await this.orderRepo.findOne({ where: { id: orderId } });
  if (!order) throw new NotFoundError('سفارش یافت نشد');
  // If userId provided (customer), verify ownership:
  if (userId && order.user_id !== userId) throw new ForbiddenError('دسترسی ندارید');
  return this.shipmentRepo.find({ where: { order_id: orderId }, order: { created_at: 'ASC' } });
}
```
Admin routes (`POST /`, `PATCH /:id`) already have `authorize(UserRole.ADMIN)` — no change needed there.

### SHP-B2 — Fix shipment → order status mapping
```ts
// shipment.repository.ts — replace the current mapping block:
const statusMap: Partial<Record<ShipmentStatus, OrderStatus>> = {
  [ShipmentStatus.SHIPPED]:           OrderStatus.SHIPPED,
  [ShipmentStatus.DELIVERED]:         OrderStatus.DELIVERED,
  [ShipmentStatus.RETURNED]:          OrderStatus.RETURNED,
  // in_transit, out_for_delivery, processing — do NOT change order status
  // failed — leave order status as-is; admin handles manually
};

const newOrderStatus = statusMap[dto.status as ShipmentStatus];
if (newOrderStatus) {
  await this.orderRepo.update(shipment.order_id, { status: newOrderStatus });
}
```

### SHP-B3 — Calculate fulfillment_status correctly
```ts
// shipment.repository.ts — after creating a shipment, check if all order items are covered:
const orderItemCount = await this.orderItemRepo.count({ where: { order_id: dto.order_id } });
const shippedItemCount = /* sum quantities across all shipments for this order */;
const fulfillmentStatus = shippedItemCount >= orderItemCount
  ? FulfillmentStatus.FULFILLED
  : FulfillmentStatus.PARTIALLY_FULFILLED;

await this.orderRepo.update(dto.order_id, { fulfillment_status: fulfillmentStatus });
```
Note: This requires the `shipment_items` relation to exist. If shipments currently have no line items, a simpler heuristic is: check if this is the only shipment and assume it covers all items → set `FULFILLED`.

### SHP-B4 — Wrap create/update in a transaction
```ts
// shipment.repository.ts — use QueryRunner:
async create(dto: CreateShipmentDto) {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();
  try {
    const shipment = queryRunner.manager.create(Shipment, { ...dto, status: ShipmentStatus.PENDING });
    await queryRunner.manager.save(shipment);
    await queryRunner.manager.update(Order, dto.order_id, {
      fulfillment_status: FulfillmentStatus.PARTIALLY_FULFILLED,
    });
    await queryRunner.commitTransaction();
    return shipment;
  } catch (err) {
    await queryRunner.rollbackTransaction();
    throw err;
  } finally {
    await queryRunner.release();
  }
}
```

### SHP-B5 — Add missing Zod validator
Create `backend/src/modules/shipments/shipment.validator.ts`:
```ts
import { z } from 'zod';

export const createShipmentSchema = z.object({
  order_id:        z.string().uuid({ message: 'شناسه سفارش نامعتبر است' }),
  courier_name:    z.string().min(1, 'نام پیک الزامی است'),
  tracking_number: z.string().min(1, 'کد رهگیری الزامی است'),
  notes:           z.string().optional(),
});

export const updateShipmentSchema = z.object({
  status:           z.enum(['pending','processing','shipped','in_transit',
                             'out_for_delivery','delivered','failed','returned']).optional(),
  tracking_number:  z.string().min(1).optional(),
  notes:            z.string().optional(),
  delivered_at:     z.string().datetime().optional(),
});
```
Then wire in `shipment.routes.ts`:
```ts
import { validate } from '../../middleware/validate';
import { createShipmentSchema, updateShipmentSchema } from './shipment.validator';

router.post('/', authenticate, authorize(UserRole.ADMIN), validate({ body: createShipmentSchema }), controller.create);
router.patch('/:id', authenticate, authorize(UserRole.ADMIN), validate({ body: updateShipmentSchema }), controller.update);
```

### SHP-F1 — Show empty state in ShipmentTimeline
```tsx
// ShipmentTimeline.tsx
if (!shipments || shipments.length === 0) {
  return (
    <p className="text-sm text-gray-500 py-4 text-center">
      هنوز اطلاعات ارسالی ثبت نشده است
    </p>
  );
}
```

### SHP-F2 — Narrow cache invalidation key
```ts
// useShipments.ts — useUpdateShipment:
onSuccess: (_, variables) => {
  queryClient.invalidateQueries({ queryKey: ['shipments', variables.orderId] });
  // requires passing orderId in mutation variables
}
```

### SHP-F4 — Show pending shipment state in order detail
```tsx
// orders/[id]/page.tsx
<section>
  <h3>اطلاعات ارسال</h3>
  {shipmentsLoading ? (
    <p className="text-sm text-gray-400">در حال بارگذاری...</p>
  ) : shipments && shipments.length > 0 ? (
    <ShipmentTimeline shipments={shipments} />
  ) : (
    <p className="text-sm text-gray-500">سفارش هنوز ارسال نشده است</p>
  )}
</section>
```
