'use client';

import type { ProductVariant } from '@/modules/variants/types/variant.types';
import { MdiCheck } from '@/components/icons/Icons';

interface VariantSelectorProps {
  variants: ProductVariant[];
  current: ProductVariant | null;
  onSelect: (variant: ProductVariant) => void;
}

/**
 * Attribute-based variant picker.
 * - Color attributes (with `color_code`) render as round swatches.
 * - Other attributes render as pill buttons.
 * Selection is resolved by {@link selectVariantValue}, which ranks candidates
 * instead of requiring an exact superset match — so switching an attribute on
 * heterogeneous variant sets never becomes a dead end.
 */
export default function VariantSelector({ variants, current, onSelect }: VariantSelectorProps) {
  if (variants.length <= 1) return null;

  const groups = groupVariantsByAttribute(variants);

  return (
    <div className="space-y-5">
      {groups.map((group) => {
        const selectedValueId = current?.attributes.find((a) => a.name === group.name)?.id;
        const isColor = group.values.some((v) => v.color_code);

        return (
          <div key={group.name}>
            <label className="mb-2.5 block text-sm font-medium text-text-secondary">
              {group.name}
              {selectedValueId && (
                <span className="text-text-primary font-semibold">
                  {'  '}
                  {group.values.find((v) => v.id === selectedValueId)?.value}
                </span>
              )}
            </label>

            <div className="flex flex-wrap gap-2.5">
              {group.values.map((val) => {
                const isSelected = selectedValueId === val.id;
                const isOutOfStock = !variants.some(
                  (v) => v.attributes.some((a) => a.id === val.id) && v.stock_quantity > 0,
                );

                const handleClick = () => {
                  if (isOutOfStock) return;
                  const matched = selectVariantValue(variants, current, group.name, val.id);
                  if (matched) onSelect(matched);
                };

                if (isColor && val.color_code) {
                  return (
                    <button
                      key={val.id}
                      type="button"
                      disabled={isOutOfStock}
                      onClick={handleClick}
                      title={val.value}
                      aria-label={val.value}
                      aria-pressed={isSelected}
                      className={`relative h-11 w-11 rounded-full border transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? 'border-primary ring-2 ring-primary ring-offset-2 ring-offset-surface'
                          : 'border-border hover:border-primary'
                      } ${isOutOfStock ? 'cursor-not-allowed opacity-40' : ''}`}
                    >
                      <span
                        className="absolute inset-1 rounded-full"
                        style={{ backgroundColor: val.color_code }}
                      />
                      {isSelected && (
                        <MdiCheck className="absolute inset-0 m-auto h-5 w-5 text-white mix-blend-difference" />
                      )}
                      {isOutOfStock && (
                        <span className="absolute inset-0 m-auto block h-px w-12 rotate-45 bg-text-muted" />
                      )}
                    </button>
                  );
                }

                return (
                  <button
                    key={val.id}
                    type="button"
                    disabled={isOutOfStock}
                    onClick={handleClick}
                    aria-pressed={isSelected}
                    className={`min-h-11 rounded-button border px-4 py-2 text-sm font-medium transition-colors duration-200 cursor-pointer ${
                      isOutOfStock
                        ? 'cursor-not-allowed border-border text-text-muted line-through opacity-40'
                        : isSelected
                          ? 'border-primary bg-primary-light text-primary'
                          : 'border-border text-text-secondary hover:border-primary'
                    }`}
                  >
                    {val.value}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Helpers ────────────────────────────────────────────────────── */

export function groupVariantsByAttribute(variants: ProductVariant[]) {
  const allAttrs = variants.flatMap((v) => v.attributes);
  const uniqueNames = [...new Set(allAttrs.map((a) => a.name))];

  return uniqueNames.map((name) => ({
    name,
    values: [
      ...new Map(allAttrs.filter((a) => a.name === name).map((a) => [a.id, a])).values(),
    ],
  }));
}

/**
 * Resolve the variant to activate when the user picks `valueId` within `groupName`.
 *
 * Ranks every variant that contains the clicked value by how many of the user's
 * *other* current selections it also matches, breaking ties toward in-stock
 * variants. The clicked value is always honoured, so heterogeneous attribute
 * sets (e.g. Black+XL ⇄ Red-only) switch correctly instead of silently failing.
 */
export function selectVariantValue(
  variants: ProductVariant[],
  current: ProductVariant | null,
  groupName: string,
  valueId: string,
): ProductVariant | null {
  const candidates = variants.filter((v) => v.attributes.some((a) => a.id === valueId));
  if (candidates.length === 0) return null;

  const otherSelections = (current?.attributes ?? []).filter((a) => a.name !== groupName);

  const score = (v: ProductVariant) =>
    otherSelections.reduce(
      (acc, sel) => acc + (v.attributes.some((a) => a.id === sel.id) ? 1 : 0),
      0,
    );

  return [...candidates].sort((a, b) => {
    const diff = score(b) - score(a);
    if (diff !== 0) return diff;
    // Tie-break: prefer an in-stock variant.
    return Number(b.stock_quantity > 0) - Number(a.stock_quantity > 0);
  })[0];
}
