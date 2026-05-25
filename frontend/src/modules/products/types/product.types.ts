import { ProductVariant } from "@/modules/variants/types/variant.types";

// src/modules/products/types/product.types.ts
export interface ProductListResponse {
  id: string;
  title: string;
  slug: string;
  short_description: string | null;
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
  brand: {
    id: string;
    name: string;
    slug: string;
    logo: string | null;
  } | null;
  thumbnail: string | null;
  price_range: {
    min: number;
    max: number;
  };
  total_stock: number;
  variants_count: number;
  avg_rating: number;
  reviews_count: number;
  is_active: boolean;
  is_public: boolean;
  created_at: string;
}

export interface ProductDetail {
  id: string;
  title: string;
  slug: string;
  short_description: string | null;
  full_description: string | null;
  specification: Record<string, any> | null;
  category: { id: string; name: string; slug: string } | null;
  brand: { id: string; name: string; slug: string; logo: string | null } | null;
  images: ProductImage[];
  variants: ProductVariant[];
  tags: Tag[];
  seo: { title: string | null; description: string | null };
  avg_rating: number;
  reviews_count: number;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  image_url: string;
  alt_text: string | null;
  is_thumbnail: boolean;
  sort_order: number;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface ProductFilters {
  brands: Array<{
    id: string;
    name: string;
    slug: string;
    logo: string | null;
    count: number;
  }>;
  price_range: {
    min: number;
    max: number;
  };
  attributes: Record<string, string[]>;
}