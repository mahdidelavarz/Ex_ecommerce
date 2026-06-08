# Module: Shipments

## Backend

| # | Issue | Severity | File |
|---|-------|----------|------|
| SHP-B1 | `GET /order/:orderId` and `GET /:id` have no ownership check — any authenticated user can read any shipment by guessing the ID | 🔴 Blocker | `shipment.routes.ts` |
| SHP-B2 | Status sync logic error: when shipment status is `in_transit` or `out_for_delivery`, order status is set to `shipped` — wrong intermediate states | 🟠 Bug | `shipment.repository.ts:71` |
| SHP-B3 | Fulfillment status always set to `partially_fulfilled` on first shipment creation — ignores whether all items are covered | 🟠 Bug | `shipment.repository.ts` |
| SHP-B4 | No database transaction — if the order status update fails after shipment insert, data is left inconsistent | 🟠 Bug | `shipment.repository.ts` |
| SHP-B5 | `shipment.validator.ts` does not exist — `POST /` and `PATCH /:id` accept any body with no Zod validation | 🟠 Bug | `shipment.routes.ts` |
| SHP-B6 | Multiple `as any` casts in repository bypass TypeScript — status enum assigned as untyped string | 🟡 Incomplete | `shipment.repository.ts:39,44,47,82` |
| SHP-B7 | No pagination on `findByOrder` — an order with many shipments returns all at once | 🟡 Incomplete | `shipment.repository.ts` |

## Frontend

| # | Issue | Severity | File |
|---|-------|----------|------|
| SHP-F1 | `ShipmentTimeline` returns `null` silently when there are no shipments — no empty state shown to user | 🟠 Bug | `ShipmentTimeline.tsx:13` |
| SHP-F2 | `useUpdateShipment` invalidates `['shipments']` globally instead of `['shipments', orderId]` — too broad | 🟠 Bug | `useShipments.ts:38` |
| SHP-F3 | No loading or error state in `ShipmentTimeline` — component renders nothing while fetching | 🟡 Incomplete | `ShipmentTimeline.tsx` |
| SHP-F4 | Order detail page shows shipments section only when `shipments.length > 0` — no "در انتظار ارسال" message for pending orders | 🟡 Incomplete | `orders/[id]/page.tsx` |
| SHP-F5 | `shipment.service.ts` uses `any` for update payload — no typed DTO on the frontend | 🟡 Incomplete | `shipment.service.ts:30` |

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
