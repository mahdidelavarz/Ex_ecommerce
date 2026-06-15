# Module: Attributes

## Status Summary

Backend is mostly correct — routes are admin-guarded, Zod validators exist, and deletion guards prevent removing in-use attributes. The main gaps are: a misplaced import that causes a runtime crash on delete, no uniqueness constraint on values, and no `type` field to distinguish color vs size attributes. Frontend has a list + create page, but editing an existing attribute hides the values section entirely — admins have no way to add new values to an existing attribute.

---

## Backend

| # | Issue | Severity | File |
|---|-------|----------|------|
| ATTR-B1 | `In` import from TypeORM is placed at line 167 (bottom), after it is used on line 114 — runtime crash when deleting an attribute | 🔴 Blocker | `attribute.repository.ts:114,167` |
| ATTR-B2 | No uniqueness constraint on `(attribute_id, value)` — duplicate values (e.g., two "Red" entries) allowed | 🟠 Bug | `attribute-value.entity.ts`, `attribute.repository.ts:129` |
| ATTR-B3 | No `type` field on `Attribute` entity — can't distinguish `color` / `size` / `text`; `color_code` cannot be conditionally required | 🟡 Incomplete | `attribute.entity.ts` |
| ATTR-B4 | No `sort_order` on `AttributeValue` — values always render in DB insertion order, not admin-configured order | 🟡 Incomplete | `attribute-value.entity.ts` |

## Frontend

| # | Issue | Severity | File |
|---|-------|----------|------|
| ATTR-F1 | Values section gated by `!isEdit` — when editing an existing attribute, the entire values block is hidden; no UI to add new values to an existing attribute | 🔴 Blocker | `admin/attributes/[id]/page.tsx:132` |
| ATTR-F2 | `color_code` registered twice on the same form field — hex text input and color-picker `<input type="color">` both bind `values.${index}.color_code`; they don't stay in sync | 🟠 Bug | `admin/attributes/[id]/page.tsx:157-167` |
| ATTR-F3 | No mutation hooks (`useCreateAttribute`, `useUpdateAttribute`, `useDeleteAttribute`) — forms call `attributeService` directly with manual try/catch; no auto cache invalidation | 🟡 Incomplete | `frontend/src/modules/attributes/` |
| ATTR-F4 | No type selector in create/edit form — no UI to mark an attribute as `color` vs `size` vs `text` (even if type field is added to backend) | 🟡 Incomplete | `admin/attributes/[id]/page.tsx` |

---

## What IS Working

- Admin sidebar links to `/admin/attributes`
- Attributes list page: renders all attributes, shows values per attribute, delete buttons
- Create form: saves attribute name + initial values including `color_code`
- Backend guards: `DELETE /attributes/:id` fails if any values are assigned to variants
- Backend guards: `DELETE /attributes/values/:valueId` fails if value is in use by a variant
- All write routes (`POST`, `PATCH`, `DELETE`) require `authenticate` + `authorize(UserRole.ADMIN)`
- Zod validators present on all mutation routes
- `useAttributes()`, `useAllAttributes()`, `useAttribute(id)` hooks functional
- Variant form (`admin/products/variants/[variantId]/page.tsx`) correctly loads attributes and saves selections
- Customer product detail page displays variant selector grouped by attribute name with color swatches

---

## Fix Solutions

### ATTR-B1 — Move `In` import to top of file
```ts
// attribute.repository.ts — move line 167 to the imports block at the top:
import { In, Repository } from 'typeorm';
```
This is a one-line fix. The `In` operator is already used on line 114 in the `delete()` method.

---

### ATTR-B2 — Enforce uniqueness on (attribute_id, value)
```ts
// attribute-value.entity.ts — add composite unique constraint:
@Entity('attribute_values')
@Unique(['attribute_id', 'value'])
export class AttributeValue extends BaseEntity {
  // ...
}

// attribute.repository.ts — addValue(): add application-level check before save:
async addValue(attributeId: string, dto: AddAttributeValueDto) {
  const existing = await this.valueRepo.findOne({
    where: { attribute_id: attributeId, value: dto.value },
  });
  if (existing) throw new ConflictError('این مقدار قبلاً ثبت شده است');
  // ... rest of save logic
}
```

---

### ATTR-B3 — Add `type` field to Attribute entity
```ts
// attribute.entity.ts
export enum AttributeType {
  COLOR = 'color',
  SIZE  = 'size',
  TEXT  = 'text',
}

@Entity('attributes')
export class Attribute extends BaseEntity {
  @Column({ type: 'varchar', default: AttributeType.TEXT })
  type: AttributeType;
  // ...
}

// attribute.validator.ts — add to create/update schema:
type: z.nativeEnum(AttributeType).default(AttributeType.TEXT),

// Conditional color_code requirement in variant validator:
// When attribute.type === 'color', color_code should be required
```

---

### ATTR-B4 — Add sort_order to AttributeValue
```ts
// attribute-value.entity.ts
@Column({ type: 'int', default: 0 })
sort_order: number;

// attribute.repository.ts — order by sort_order in all value queries:
values: { order: { sort_order: 'ASC' } }

// Add PATCH /attributes/values/:valueId/reorder endpoint for admin drag-and-drop
```

---

### ATTR-F1 — Show value management when editing
```tsx
// admin/attributes/[id]/page.tsx — remove the !isEdit gate:
// BEFORE:
{!isEdit && (
  <div>/* values section */</div>
)}

// AFTER — always show, but split into two sub-sections:
<div>
  {/* Existing values (shown in edit mode too) */}
  {isEdit && attribute?.values?.map(val => (
    <div key={val.id} className="flex items-center justify-between">
      <span>{val.value}</span>
      <button onClick={() => deleteValue(val.id)}>حذف</button>
    </div>
  ))}

  {/* Add new value form (shown in both create and edit) */}
  {fields.map((field, index) => (
    <div key={field.id}>/* existing value input row */</div>
  ))}
  <button type="button" onClick={() => append({ value: '', color_code: '' })}>
    + افزودن مقدار
  </button>
</div>
```
When in edit mode (`isEdit === true`), submit the new values via `attributeService.addValue()` directly rather than including them in the main form submit.

---

### ATTR-F2 — Fix color_code double-registration
```tsx
// admin/attributes/[id]/page.tsx — use watch + setValue to sync the two inputs:
const colorCode = watch(`values.${index}.color_code`);

{/* Text hex input */}
<input
  {...register(`values.${index}.color_code`)}
  placeholder="#000000"
  className="border rounded px-2 py-1 w-24 text-sm font-mono"
/>

{/* Color picker — NOT registered, uses onChange to update the field */}
<input
  type="color"
  value={colorCode || '#000000'}
  onChange={e => setValue(`values.${index}.color_code`, e.target.value)}
  className="w-8 h-8 cursor-pointer rounded"
/>
```

---

### ATTR-F3 — Add mutation hooks
```ts
// frontend/src/modules/attributes/hooks/useAttributes.ts — add:
export const useCreateAttribute = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAttributeDto) => attributeService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attributes'] });
      toast.success('ویژگی ایجاد شد');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'خطا'),
  });
};

export const useDeleteAttribute = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => attributeService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['attributes'] }),
    onError: (e: any) => toast.error(e.response?.data?.message || 'خطا'),
  });
};

// Similar for useUpdateAttribute, useAddAttributeValue, useDeleteAttributeValue
```
