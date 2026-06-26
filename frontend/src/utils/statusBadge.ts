// src/utils/statusBadge.ts
// Single source of truth for domain status -> Badge variant + Farsi label.
// Replaces the duplicated `statusColors`/`statusLabels`/`statusConfig` maps
// that were copy-pasted across order/payment/shipment/return pages.
//
// Usage:
//   const { variant, label } = orderStatusBadge(order.order_status);
//   <Badge variant={variant}>{label}</Badge>
import type { BadgeProps } from '@/components/ui';

type BadgeVariant = NonNullable<BadgeProps['variant']>;

export interface StatusBadge {
  variant: BadgeVariant;
  label: string;
}

const FALLBACK: Omit<StatusBadge, 'label'> = { variant: 'neutral' };

/** Build a lookup that falls back to a neutral badge using the raw key as label. */
function makeLookup(map: Record<string, StatusBadge>) {
  return (status: string | null | undefined): StatusBadge => {
    if (status && map[status]) return map[status];
    return { ...FALLBACK, label: status ?? '-' };
  };
}

// --- Order status -----------------------------------------------------------
export const orderStatusBadge = makeLookup({
  pending: { variant: 'warning', label: 'در انتظار' },
  confirmed: { variant: 'info', label: 'تایید شده' },
  processing: { variant: 'info', label: 'در حال پردازش' },
  shipped: { variant: 'primary', label: 'ارسال شده' },
  delivered: { variant: 'success', label: 'تحویل شده' },
  cancelled: { variant: 'error', label: 'لغو شده' },
  returned: { variant: 'error', label: 'مرجوع شده' },
});

// --- Payment status ---------------------------------------------------------
export const paymentStatusBadge = makeLookup({
  pending: { variant: 'warning', label: 'در انتظار' },
  paid: { variant: 'success', label: 'پرداخت شده' },
  failed: { variant: 'error', label: 'ناموفق' },
  refunded: { variant: 'error', label: 'بازگشت داده شده' },
  partially_paid: { variant: 'info', label: 'پرداخت جزئی' },
});

// --- Shipment status --------------------------------------------------------
export const shipmentStatusBadge = makeLookup({
  pending: { variant: 'warning', label: 'در انتظار' },
  processing: { variant: 'info', label: 'در حال پردازش' },
  shipped: { variant: 'primary', label: 'ارسال شده' },
  in_transit: { variant: 'primary', label: 'در مسیر' },
  out_for_delivery: { variant: 'info', label: 'خارج از تحویل' },
  delivered: { variant: 'success', label: 'تحویل شده' },
  failed: { variant: 'error', label: 'ناموفق' },
  returned: { variant: 'error', label: 'بازگشت خورده' },
});

// --- Return status ----------------------------------------------------------
export const returnStatusBadge = makeLookup({
  pending: { variant: 'warning', label: 'در انتظار بررسی' },
  approved: { variant: 'success', label: 'تایید شده' },
  rejected: { variant: 'error', label: 'رد شده' },
  received: { variant: 'info', label: 'دریافت شد' },
  refunded: { variant: 'success', label: 'وجه بازگشت یافت' },
});
