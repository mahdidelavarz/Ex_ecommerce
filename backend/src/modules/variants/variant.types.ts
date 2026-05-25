// src/modules/variants/variant.types.ts
export interface VariantResponse {
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
  attributes: {
    id: string;
    name: string;
    value: string;
    color_code: string | null;
  }[];
  images: {
    id: string;
    image_url: string;
    sort_order: number;
  }[];
  created_at: Date;
  updated_at: Date;
}

export interface CreateVariantDto {
  sku: string;
  barcode?: string | null;
  price: number;
  compare_at_price?: number | null;
  cost?: number;
  weight?: number | null;
  stock_quantity?: number;
  low_stock_threshold?: number | null;
  is_active?: boolean;
  attribute_value_ids?: string[];
  images?: { image_url: string; sort_order?: number }[];
}

export interface UpdateVariantDto {
  sku?: string;
  barcode?: string | null;
  price?: number;
  compare_at_price?: number | null;
  cost?: number;
  weight?: number | null;
  stock_quantity?: number;
  low_stock_threshold?: number | null;
  is_active?: boolean;
  attribute_value_ids?: string[];
}

export interface BulkStockDto {
  items: { id: string; stock_quantity: number }[];
}