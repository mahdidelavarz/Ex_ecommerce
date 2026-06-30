// src/modules/dashboard/components/TopProductsCard.tsx
'use client';

import Link from 'next/link';
import { Skeleton } from '@/components/ui';
import { formatPrice } from '@/utils/formatPrice';
import { toPersianDigits } from '@/utils/toPersianDigits';
import { MdiTrendingUp, MdiPackageVariant } from '@/components/icons/Icons';
import type { TopProduct } from '../types/dashboard.types';

export default function TopProductsCard({
  data,
  loading,
}: {
  data: TopProduct[] | undefined;
  loading: boolean;
}) {
  const maxQty = data && data.length > 0 ? Math.max(...data.map((p) => p.quantity_sold)) : 0;

  return (
    <div className="bg-surface rounded-card shadow-card p-6">
      <h2 className="font-bold text-text-primary flex items-center gap-2 mb-5">
        <MdiTrendingUp className="w-5 h-5 text-success" />
        پرفروش‌ترین محصولات
      </h2>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        <div className="py-10 flex flex-col items-center justify-center text-text-muted text-sm gap-2">
          <MdiPackageVariant className="w-8 h-8 opacity-50" />
          فروشی در این بازه ثبت نشده است
        </div>
      ) : (
        <ul className="space-y-3.5">
          {data.map((product, index) => (
            <li key={product.product_id ?? `${product.product_title}-${index}`} className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-primary-light text-primary text-xs font-bold flex items-center justify-center shrink-0">
                {toPersianDigits(index + 1)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2 mb-1">
                  {product.product_id ? (
                    <Link
                      href={`/admin/products/${product.product_id}`}
                      className="text-sm font-medium text-text-primary truncate hover:text-primary transition-colors"
                    >
                      {product.product_title}
                    </Link>
                  ) : (
                    <span className="text-sm font-medium text-text-primary truncate">{product.product_title}</span>
                  )}
                  <span className="text-xs text-text-muted shrink-0">
                    {toPersianDigits(product.quantity_sold)} فروش
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-surface-raised overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: maxQty > 0 ? `${(product.quantity_sold / maxQty) * 100}%` : '0%' }}
                    />
                  </div>
                  <span className="text-xs text-text-secondary shrink-0">{formatPrice(product.revenue)}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
