// src/modules/orders/order.types.ts
export interface CreateOrderDto {
  shipping_address_id: string;
  billing_address_id: string;
  coupon_code?: string;
  customer_note?: string;
}

export interface OrderItemResponse {
  id: string;
  product_title: string;
  variant_title: string | null;
  sku: string;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  product_snapshot: any;
}

export interface OrderResponse {
  id: string;
  order_number: string;
  user_id: string | null;
  currency_code: string;
  subtotal: number;
  discount_amount: number;
  shipping_amount: number;
  tax_amount: number;
  total_amount: number;
  paid_amount: number;
  due_amount: number;
  payment_status: string;
  fulfillment_status: string;
  order_status: string;
  shipping_address_snapshot: any;
  billing_address_snapshot: any;
  customer_email: string;
  customer_phone: string;
  customer_note: string | null;
  admin_note: string | null;
  placed_at: Date | null;
  items: OrderItemResponse[];
  created_at: Date;
  updated_at: Date;
}

export interface OrderListResponse {
  id: string;
  order_number: string;
  total_amount: number;
  payment_status: string;
  fulfillment_status: string;
  order_status: string;
  items_count: number;
  created_at: Date;
}