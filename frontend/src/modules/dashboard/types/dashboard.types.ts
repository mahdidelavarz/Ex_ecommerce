// src/modules/dashboard/types/dashboard.types.ts
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
  total_orders: number;
  pending_orders: number;
  total_products: number;
  total_customers: number;
  low_stock_count: number;
  orders_by_status: Record<string, number>;
  recent_orders: DashboardRecentOrder[];
}
