// src/shared/utils/inventory-log.ts
//
// Single helper for writing an InventoryLog row inside a transaction so every
// stock change (order placed/cancelled, return received, manual adjustment)
// records an audit trail consistently.
import { EntityManager } from 'typeorm';
import { InventoryLog, InventoryLogType } from '../../database/entities/inventory-log.entity';

export interface InventoryLogInput {
  variantId: string;
  type: InventoryLogType;
  quantityBefore: number;
  quantityChange: number;
  quantityAfter: number;
  referenceType: string;
  referenceId?: string | null;
  note?: string | null;
  createdBy?: string | null;
}

export async function writeInventoryLog(
  manager: EntityManager,
  input: InventoryLogInput,
): Promise<void> {
  await manager.insert(InventoryLog, {
    variant_id: input.variantId,
    type: input.type,
    quantity_before: input.quantityBefore,
    quantity_change: input.quantityChange,
    quantity_after: input.quantityAfter,
    reference_type: input.referenceType,
    reference_id: input.referenceId ?? null,
    note: input.note ?? null,
    created_by: input.createdBy ?? null,
  });
}
