"use client";

import { useVariants } from "@/modules/variants/hooks/useVariants";
import { Skeleton } from "@/components/ui";
import { MdiPackageVariantClosed } from "@/components/icons/Icons";

/**
 * Per-variant stock breakdown shown when an admin expands a product row.
 * Lazily fetches the product's variants (the query only runs once mounted).
 */
export default function ProductVariantBreakdown({
  productId,
}: {
  productId: string;
}) {
  const { data: variants, isLoading } = useVariants(productId);

  if (isLoading) {
    return (
      <div className="space-y-2 py-2">
        {[...Array(2)].map((_, i) => (
          <Skeleton key={i} className="h-9 w-full" />
        ))}
      </div>
    );
  }

  if (!variants || variants.length === 0) {
    return (
      <div className="flex items-center gap-2 py-3 text-sm text-text-muted">
        <MdiPackageVariantClosed className="w-4 h-4" />
        واریانتی برای این محصول ثبت نشده است
      </div>
    );
  }

  return (
    <div className="space-y-2 py-1">
      {variants.map((variant) => {
        const isLow =
          variant.low_stock_threshold != null &&
          variant.stock_quantity <= variant.low_stock_threshold;

        return (
          <div
            key={variant.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-card bg-surface-raised px-3 py-2"
          >
            <div className="flex flex-wrap items-center gap-2">
              {variant.attributes.length > 0 ? (
                variant.attributes.map((attr) => (
                  <span
                    key={attr.id}
                    className="inline-flex items-center gap-1.5 rounded-full bg-surface px-2.5 py-1 text-xs text-text-secondary"
                  >
                    {attr.color_code && (
                      <span
                        className="inline-block w-3 h-3 rounded-full border border-border"
                        style={{ backgroundColor: attr.color_code }}
                      />
                    )}
                    {attr.value}
                  </span>
                ))
              ) : (
                <span className="text-xs text-text-muted">بدون ویژگی</span>
              )}
              <code className="text-xs text-text-muted">{variant.sku}</code>
            </div>

            <div className="flex items-center gap-3">
              {isLow && variant.stock_quantity > 0 && (
                <span className="text-xs text-warning">کمتر از حد مجاز</span>
              )}
              <span
                className={`text-sm font-medium ${
                  variant.stock_quantity === 0 ? "text-error" : "text-success"
                }`}
              >
                موجودی: {variant.stock_quantity}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
