// src/modules/cart/types/cart.types.ts
export interface CartVariant {
  id: string;
  sku: string;
  price: number;
  compare_at_price: number | null;
  stock_quantity: number;
  is_active: boolean;
  attributes: Array<{
    name: string;
    value: string;
    color_code: string | null;
  }>;
  image: string | null;
  product: {
    id: string;
    title: string;
    slug: string;
    is_active: boolean;
  } | null;
}

export interface CartItem {
  id: string;
  variant_id: string;
  quantity: number;
  variant: CartVariant;
}

export interface Cart {
  id: string;
  items: CartItem[];
  total_items: number;
  total_quantity: number;
  subtotal: number;
  created_at: string;
  updated_at: string;
}