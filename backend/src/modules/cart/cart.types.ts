// src/modules/cart/cart.types.ts
export interface CartItemResponse {
  id: string;
  variant_id: string;
  quantity: number;
  variant: {
    id: string;
    sku: string;
    price: number;
    compare_at_price: number | null;
    stock_quantity: number;
    is_active: boolean;
    attributes: { name: string; value: string; color_code: string | null }[];
    image: string | null;
    product: {
      id: string;
      title: string;
      slug: string;
      is_active: boolean;
    };
  };
}

export interface CartResponse {
  id: string;
  items: CartItemResponse[];
  total_items: number;
  total_quantity: number;
  subtotal: number;
  created_at: Date;
  updated_at: Date;
}

export interface AddToCartDto {
  variant_id: string;
  quantity: number;
}

export interface UpdateCartItemDto {
  quantity: number;
}