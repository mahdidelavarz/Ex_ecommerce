// src/modules/coupons/types/coupon.types.ts
export type CouponType = 'percentage' | 'fixed' | 'free_shipping';

export interface Coupon {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  min_order_amount: number | null;
  max_discount: number | null;
  usage_limit: number | null;
  usage_per_user: number | null;
  used_count: number;
  starts_at: string;
  expires_at: string;
  is_active: boolean;
  products: { id: string; title: string }[];
  categories: { id: string; name: string }[];
  created_at: string;
  updated_at: string;
}

export interface CouponValidation {
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