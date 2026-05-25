// src/modules/coupons/coupon.types.ts
export type CouponType = 'percentage' | 'fixed' | 'free_shipping';

export interface CouponResponse {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  min_order_amount: number | null;
  max_discount: number | null;
  usage_limit: number | null;
  usage_per_user: number | null;
  used_count: number;
  starts_at: Date;
  expires_at: Date;
  is_active: boolean;
  products: { id: string; title: string }[];
  categories: { id: string; name: string }[];
  created_at: Date;
  updated_at: Date;
}

export interface CreateCouponDto {
  code: string;
  type: CouponType;
  value: number;
  min_order_amount?: number | null;
  max_discount?: number | null;
  usage_limit?: number | null;
  usage_per_user?: number | null;
  starts_at: string;
  expires_at: string;
  is_active?: boolean;
  product_ids?: string[];
  category_ids?: string[];
}

export interface UpdateCouponDto {
  code?: string;
  type?: CouponType;
  value?: number;
  min_order_amount?: number | null;
  max_discount?: number | null;
  usage_limit?: number | null;
  usage_per_user?: number | null;
  starts_at?: string;
  expires_at?: string;
  is_active?: boolean;
  product_ids?: string[];
  category_ids?: string[];
}

export interface ValidateCouponDto {
  code: string;
  cart_total: number;
  product_ids: string[];
}

export interface ValidateCouponResponse {
  valid: boolean;
  coupon?: {
    id: string;
    code: string;
    type: CouponType;
    value: number;
  };
  discount_amount: number;
  final_amount: number;
}