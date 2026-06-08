---
name: database-entities
description: TypeORM entity inventory grouped by domain — 30+ entities in backend/src/database/entities/
metadata:
  type: project
---

# Database Entities

All entities extend `base.entity.ts` which adds `id` (UUID), `createdAt`, `updatedAt`.

Location: `backend/src/database/entities/`

## Users & Auth

| File | Table | Notes |
|------|-------|-------|
| `user.entity.ts` | `users` | roles: customer/admin/support, phone_number as login key |
| `user-address.entity.ts` | `user_addresses` | multiple addresses per user |
| `otp-code.entity.ts` | `otp_codes` | expires in 2min, max 3 attempts |
| `refresh-token.entity.ts` | `refresh_tokens` | JWT refresh token rotation |
| `login-log.entity.ts` | `login_logs` | audit trail |

## Catalog

| File | Table | Notes |
|------|-------|-------|
| `category.entity.ts` | `categories` | hierarchical (self-referential parent/children) |
| `brand.entity.ts` | `brands` | products belong to a brand |
| `product.entity.ts` | `products` | has slug, relates to category, brand, tags |
| `product-image.entity.ts` | `product_images` | gallery images per product |
| `product-tag.entity.ts` | `product_tags` | junction table products ↔ tags |
| `tag.entity.ts` | `tags` | |
| `attribute.entity.ts` | `attributes` | e.g. "Color", "Size" |
| `attribute-value.entity.ts` | `attribute_values` | e.g. "Red", "XL" |
| `product-variant.entity.ts` | `product_variants` | SKU-level: price, stock, sku |
| `variant-attribute-value.entity.ts` | `variant_attribute_values` | variant ↔ attribute_value mapping |
| `variant-image.entity.ts` | `variant_images` | variant-specific images |

**FACT**: `brand.entity.ts` exists — confirmed via direct entity directory listing.

## Commerce

| File | Table | Notes |
|------|-------|-------|
| `cart.entity.ts` | `carts` | supports guest (sessionId) + authenticated (userId) |
| `cart-item.entity.ts` | `cart_items` | |
| `coupon.entity.ts` | `coupons` | type: percentage/fixed/free_shipping |
| `coupon-product.entity.ts` | `coupon_products` | product-scoped coupons |
| `coupon-category.entity.ts` | `coupon_categories` | category-scoped coupons |
| `order.entity.ts` | `orders` | status enum, immutable snapshot pattern |
| `order-item.entity.ts` | `order_items` | copies product data at purchase time (price snapshot) |
| `payment.entity.ts` | `payments` | tracks payment status |
| `shipment.entity.ts` | `shipments` | shipment tracking |

## Engagement

| File | Table | Notes |
|------|-------|-------|
| `review.entity.ts` | `reviews` | 5-star rating, helpful votes |
| `wishlist.entity.ts` | `wishlists` | |
| `return.entity.ts` | `returns` | return request header |
| `return-item.entity.ts` | `return_items` | line items for a return |
| `inventory-log.entity.ts` | `inventory_logs` | audit trail for stock changes |

## Key Design Decisions

- **Order snapshots**: `order_items` copies product/price at purchase time — prices won't drift after order placed
- **Guest cart**: carts can exist without a user (session-based), merge on login
- **Hierarchical categories**: self-referential parent relationship
- **Variant-level pricing/stock**: stock and price live on `product_variants`, not `products`
