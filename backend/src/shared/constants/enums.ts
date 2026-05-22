// src/shared/constants/enums.ts
export enum UserRole {
  CUSTOMER = 'customer',
  ADMIN = 'admin',
  SUPPORT = 'support',
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  RETURNED = 'returned',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PARTIALLY_PAID = 'partially_paid',
  PAID = 'paid',
  REFUNDED = 'refunded',
  FAILED = 'failed',
}

export enum FulfillmentStatus {
  UNFULFILLED = 'unfulfilled',
  PARTIALLY_FULFILLED = 'partially_fulfilled',
  FULFILLED = 'fulfilled',
}

export enum CouponType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
  FREE_SHIPPING = 'free_shipping',
}

export enum ShipmentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  IN_TRANSIT = 'in_transit',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  RETURNED = 'returned',
}

export enum ReturnStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  RECEIVED = 'received',
  REFUNDED = 'refunded',
}

export enum InventoryLogType {
  ORDER_PLACED = 'order_placed',
  ORDER_CANCELLED = 'order_cancelled',
  RETURN_RECEIVED = 'return_received',
  STOCK_ADJUSTMENT = 'stock_adjustment',
  STOCK_IMPORT = 'stock_import',
  DAMAGE_LOSS = 'damage_loss',
}

export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  PAYPAL = 'paypal',
  STRIPE = 'stripe',
  BANK_TRANSFER = 'bank_transfer',
  CASH_ON_DELIVERY = 'cash_on_delivery',
}