// src/modules/orders/types/order.types.ts
export interface OrderItem {
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

export interface Order {
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
  payment_status: 'pending' | 'partially_paid' | 'paid' | 'refunded' | 'failed';
  fulfillment_status: 'unfulfilled' | 'partially_fulfilled' | 'fulfilled';
  order_status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  shipping_address_snapshot: any;
  billing_address_snapshot: any;
  customer_email: string;
  customer_phone: string;
  customer_note: string | null;
  admin_note: string | null;
  placed_at: string | null;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface OrderSummary {
  id: string;
  order_number: string;
  total_amount: number;
  payment_status: string;
  fulfillment_status: string;
  order_status: string;
  items_count: number;
  created_at: string;
}