// src/modules/shipments/types/shipment.types.ts
export interface Shipment {
  id: string;
  order_id: string;
  tracking_number: string;
  courier_name: string;
  tracking_url: string | null;
  status: ShipmentStatus;
  shipped_at: string | null;
  delivered_at: string | null;
  estimated_delivery_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type ShipmentStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'failed'
  | 'returned';

export const shipmentStatusLabels: Record<ShipmentStatus, string> = {
  pending: 'در انتظار',
  processing: 'در حال پردازش',
  shipped: 'ارسال شده',
  in_transit: 'در مسیر',
  out_for_delivery: 'خارج از تحویل',
  delivered: 'تحویل شده',
  failed: 'ناموفق',
  returned: 'بازگشت خورده',
};

export interface UpdateShipmentDto {
  status?: ShipmentStatus;
  tracking_url?: string;
  shipped_at?: string;
  delivered_at?: string;
  notes?: string;
}

export const shipmentStatusColors: Record<ShipmentStatus, string> = {
  pending: 'bg-warning-light text-warning',
  processing: 'bg-info-light text-info',
  shipped: 'bg-primary-light text-primary',
  in_transit: 'bg-primary-light text-primary',
  out_for_delivery: 'bg-info-light text-info',
  delivered: 'bg-success-light text-success',
  failed: 'bg-error-light text-error',
  returned: 'bg-error-light text-error',
};