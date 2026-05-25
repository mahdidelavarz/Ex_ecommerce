// src/modules/variants/types/variant.types.ts
export interface VariantAttribute {
  id: string;
  name: string;
  value: string;
  color_code: string | null;
}

export interface VariantImage {
  id: string;
  image_url: string;
  sort_order: number;
}

export interface ProductVariant {
  id: string;
  sku: string;
  barcode: string | null;
  price: number;
  compare_at_price: number | null;
  cost: number;
  weight: number | null;
  stock_quantity: number;
  low_stock_threshold: number | null;
  is_active: boolean;
  attributes: VariantAttribute[];
  images: VariantImage[];
  created_at: string;
  updated_at: string;
}