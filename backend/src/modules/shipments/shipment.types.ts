// src/modules/shipments/shipment.types.ts
export interface ShipmentResponse {
  id: string;
  order_id: string;
  tracking_number: string;
  courier_name: string;
  tracking_url: string | null;
  status: 'pending' | 'processing' | 'shipped' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed' | 'returned';
  shipped_at: string | null;
  delivered_at: string | null;
  estimated_delivery_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateShipmentDto {
  order_id: string;
  tracking_number: string;
  courier_name: string;
  tracking_url?: string;
  estimated_delivery_at?: string;
  notes?: string;
}

export interface UpdateShipmentDto {
  status?: string;
  tracking_url?: string;
  shipped_at?: string;
  delivered_at?: string;
  notes?: string;
}