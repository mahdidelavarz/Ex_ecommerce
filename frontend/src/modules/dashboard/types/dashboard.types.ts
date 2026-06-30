// src/modules/dashboard/types/dashboard.types.ts
export type DashboardPeriod = '7d' | '30d' | 'month' | 'all';

export interface DashboardRecentOrder {
  id: string;
  order_number: string;
  customer_name: string;
  total_amount: number;
  order_status: string;
  payment_status: string;
  created_at: string;
}

export interface DashboardStats {
  total_revenue: number;
  total_sell: number;
  total_cogs: number;
  total_discount: number;
  total_items_sold: number;
  total_profit: number;
  avg_order_value: number;
  paid_orders_count: number;
  total_orders: number;
  pending_orders: number;
  total_products: number;
  total_customers: number;
  low_stock_count: number;
  orders_by_status: Record<string, number>;
  recent_orders: DashboardRecentOrder[];
}

export interface SalesSeriesPoint {
  date: string;
  sell: number;
  cogs: number;
  profit: number;
  items: number;
  orders: number;
}

export interface TopProduct {
  product_id: string | null;
  product_title: string;
  quantity_sold: number;
  revenue: number;
}

export interface LowStockVariantAttribute {
  name: string;
  value: string;
  color_code: string | null;
}

export interface LowStockVariant {
  variant_id: string;
  sku: string;
  stock_quantity: number;
  low_stock_threshold: number | null;
  product_id: string;
  product_title: string;
  attributes: LowStockVariantAttribute[];
}
