// src/app/(admin)/admin/products/[id]/variants/page.tsx
'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { useVariants } from '@/modules/variants/hooks/useVariants';
import { variantService } from '@/modules/variants/services/variant.service';
import { useAdminRoute } from '@/modules/auth/hooks/useAdminRoute';
import AdminSidebar from '@/components/layout/AdminSidebar';
import { Badge, Button, Card, EmptyState, Input, Skeleton } from '@/components/ui';
import { formatPrice } from '@/utils/formatPrice';
import type { ProductVariant } from '@/modules/variants/types/variant.types';
import { LucidePencil, LucidePlus, MdiArrowRight, MdiCheckCircle, MdiClose, MdiImageOff, MdiPackageVariantClosed, MdiTrashCan, SvgSpinnersRingResize } from '@/components/icons/Icons';

export default function AdminProductVariantsPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const { isLoading: isAuthLoading } = useAdminRoute();

  const { data: variants, isLoading, refetch } = useVariants(productId);

  const handleDelete = async (variant: ProductVariant) => {
    if (!window.confirm(`آیا از حذف واریانت "${variant.sku}" اطمینان دارید؟`)) return;
    try {
      await variantService.delete(variant.id);
      toast.success('واریانت حذف شد');
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'خطا در حذف واریانت');
    }
  };

  const handleStockUpdate = async (variantId: string, newStock: number) => {
    try {
      await variantService.bulkStock([{ id: variantId, stock_quantity: newStock }]);
      toast.success('موجودی بروزرسانی شد');
      refetch();
    } catch (error: any) {
      toast.error('خطا در بروزرسانی موجودی');
    }
  };

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <SvgSpinnersRingResize className="  text-primary" width={48} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 lg:mr-64 p-4 lg:p-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button onClick={() => router.back()} className="p-2 hover:bg-surface-raised rounded-button">
                <MdiArrowRight className="w-5 h-5 text-text-secondary" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-text-primary">واریانت‌های محصول</h1>
                <p className="text-text-secondary text-sm mt-1">مدیریت قیمت، موجودی و ویژگی‌ها</p>
              </div>
            </div>
            <Button
              onClick={() => router.push(`/admin/products/variants/new?productId=${productId}`)}
              icon={LucidePlus}
            >
              واریانت جدید
            </Button>
          </div>

          {/* Variants List */}
          <div className="space-y-4">
            {isLoading ? (
              [...Array(2)].map((_, i) => (
                <div key={i} className="bg-surface rounded-card shadow-card p-6">
                  <Skeleton className="h-4 w-1/4 mb-4" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))
            ) : variants?.length === 0 ? (
              <Card className="py-4">
                <EmptyState
                  icon={MdiPackageVariantClosed}
                  title="هیچ واریانتی برای این محصول ثبت نشده"
                >
                  <Button
                    onClick={() => router.push(`/admin/products/variants/new?productId=${productId}`)}
                    icon={LucidePlus}
                  >
                    ایجاد اولین واریانت
                  </Button>
                </EmptyState>
              </Card>
            ) : (
              variants?.map((variant) => (
                <VariantCard
                  key={variant.id}
                  variant={variant}
                  onEdit={() => router.push(`/admin/products/variants/${variant.id}`)}
                  onDelete={() => handleDelete(variant)}
                  onStockUpdate={(stock) => handleStockUpdate(variant.id, stock)}
                />
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function VariantCard({
  variant,
  onEdit,
  onDelete,
  onStockUpdate,
}: {
  variant: ProductVariant;
  onEdit: () => void;
  onDelete: () => void;
  onStockUpdate: (stock: number) => void;
}) {
  const [editingStock, setEditingStock] = useState(false);
  const [stockValue, setStockValue] = useState<number | "">(variant.stock_quantity);
  const hasDiscount = variant.compare_at_price && variant.compare_at_price > variant.price;

  return (
    <Card className="hover:shadow-card-hover transition-all p-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Images */}
        <div className="flex gap-2">
          {variant.images?.length > 0 ? (
            variant.images.map((img) => (
              <img
                key={img.id}
                src={img.image_url}
                alt={variant.sku}
                className="w-16 h-16 rounded-lg object-cover border border-border"
              />
            ))
          ) : (
            <div className="w-16 h-16 rounded-lg bg-surface-raised flex items-center justify-center">
              <MdiImageOff className="w-6 h-6 text-text-muted" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* SKU & Attributes */}
          <div>
            <p className="text-sm font-medium text-text-primary">{variant.sku}</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {variant.attributes?.map((attr) => (
                <span
                  key={attr.id}
                  className="inline-flex items-center gap-1 bg-surface-raised px-2 py-1 rounded text-xs text-text-secondary"
                >
                  {attr.color_code && (
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: attr.color_code }} />
                  )}
                  {attr.value}
                </span>
              ))}
            </div>
          </div>

          {/* Price */}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-text-primary">{formatPrice(variant.price)}</span>
              {hasDiscount && (
                <span className="text-sm text-text-muted line-through">{formatPrice(variant.compare_at_price!)}</span>
              )}
            </div>
            {hasDiscount && (
              <span className="text-xs text-success font-medium">
                {Math.round(((variant.compare_at_price! - variant.price) / variant.compare_at_price!) * 100)}% تخفیف
              </span>
            )}
          </div>

          {/* Stock */}
          <div>
            {editingStock ? (
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  wrapperClassName="w-20"
                  value={stockValue}
                  onChange={(e) => setStockValue(e.target.value === "" ? "" : parseInt(e.target.value))}
                  className="text-sm text-center py-1"
                  autoFocus
                />
                <button
                  onClick={() => { onStockUpdate(stockValue === "" ? 0 : stockValue); setEditingStock(false); }}
                  className="p-1 text-success hover:bg-success-light rounded"
                >
                  <MdiCheckCircle className="w-4 h-4" />
                </button>
                <button
                  onClick={() => { setStockValue(variant.stock_quantity); setEditingStock(false); }}
                  className="p-1 text-error hover:bg-error-light rounded"
                >
                  <MdiClose className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${variant.stock_quantity === 0 ? 'text-error' : 'text-success'}`}>
                  موجودی: {variant.stock_quantity}
                </span>
                <button onClick={() => setEditingStock(true)} className="p-1 hover:bg-surface-raised rounded text-text-muted">
                  <LucidePencil className="w-3 h-3" />
                </button>
              </div>
            )}
            {variant.low_stock_threshold && variant.stock_quantity <= variant.low_stock_threshold && (
              <span className="text-xs text-warning">کمتر از حد مجاز</span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex lg:flex-col gap-1">
          <button onClick={onEdit} className="p-2 hover:bg-primary-light rounded-button text-primary" title="ویرایش">
            <LucidePencil className="w-4 h-4" />
          </button>
          <button onClick={onDelete} className="p-2 hover:bg-error-light rounded-button text-error" title="حذف">
            <MdiTrashCan className="w-4 h-4" />
          </button>
          <Badge variant={variant.is_active ? 'success' : 'error'} size="sm" className="justify-center">
            {variant.is_active ? 'فعال' : 'غیرفعال'}
          </Badge>
        </div>
      </div>
    </Card>
  );
}