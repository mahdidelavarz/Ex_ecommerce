// src/modules/wishlist/types/wishlist.types.ts
export interface WishlistItem {
  id: string;
  variant_id: string;
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
    } | null;
  };
  created_at: string;
}