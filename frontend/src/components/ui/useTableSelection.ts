// src/components/ui/useTableSelection.ts
// Row-selection state for admin tables: a Set of selected ids plus the
// select-all / per-row toggles every list page would otherwise reimplement.
// The page still owns the bulk-action bar and the API call — call `clear()`
// after a successful bulk action.
import { useCallback, useMemo, useState } from "react";

export interface TableSelection<T> {
  selectedIds: Set<string>;
  isSelected: (row: T) => boolean;
  toggle: (row: T) => void;
  /** Select or clear every row currently passed in `rows`. */
  toggleAll: (checked: boolean) => void;
  /** True when there are rows and all of them are selected. */
  allSelected: boolean;
  clear: () => void;
  count: number;
}

export default function useTableSelection<T>(
  rows: T[] | undefined,
  getId: (row: T) => string,
): TableSelection<T> {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const isSelected = useCallback(
    (row: T) => selectedIds.has(getId(row)),
    [selectedIds, getId],
  );

  const toggle = useCallback(
    (row: T) => {
      const id = getId(row);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
      });
    },
    [getId],
  );

  const toggleAll = useCallback(
    (checked: boolean) => {
      setSelectedIds(checked ? new Set((rows ?? []).map(getId)) : new Set());
    },
    [rows, getId],
  );

  const clear = useCallback(() => setSelectedIds(new Set()), []);

  const allSelected = useMemo(
    () => !!rows?.length && rows.every((row) => selectedIds.has(getId(row))),
    [rows, selectedIds, getId],
  );

  return {
    selectedIds,
    isSelected,
    toggle,
    toggleAll,
    allSelected,
    clear,
    count: selectedIds.size,
  };
}
