import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1749980000000 implements MigrationInterface {
  name = 'InitialSchema1749980000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── Enum types ────────────────────────────────────────────────────────────
    await queryRunner.query(`CREATE TYPE "users_role_enum" AS ENUM ('customer', 'admin', 'support')`);
    await queryRunner.query(`CREATE TYPE "coupons_type_enum" AS ENUM ('percentage', 'fixed', 'free_shipping')`);
    await queryRunner.query(`CREATE TYPE "orders_payment_status_enum" AS ENUM ('pending', 'partially_paid', 'paid', 'refunded', 'failed')`);
    await queryRunner.query(`CREATE TYPE "orders_fulfillment_status_enum" AS ENUM ('unfulfilled', 'partially_fulfilled', 'fulfilled')`);
    await queryRunner.query(`CREATE TYPE "orders_order_status_enum" AS ENUM ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned')`);
    await queryRunner.query(`CREATE TYPE "payments_status_enum" AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded', 'partially_refunded', 'cancelled')`);
    await queryRunner.query(`CREATE TYPE "shipments_status_enum" AS ENUM ('pending', 'processing', 'shipped', 'in_transit', 'out_for_delivery', 'delivered', 'failed', 'returned')`);
    await queryRunner.query(`CREATE TYPE "returns_status_enum" AS ENUM ('pending', 'approved', 'rejected', 'received', 'refunded')`);
    await queryRunner.query(`CREATE TYPE "inventory_logs_type_enum" AS ENUM ('order_placed', 'order_cancelled', 'return_received', 'stock_adjustment', 'stock_import', 'damage_loss')`);

    // ── Root tables (no FK deps) ──────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id"                uuid                 NOT NULL DEFAULT gen_random_uuid(),
        "email"             text,
        "phone_number"      text,
        "full_name"         text,
        "birthday"          date,
        "role"              "users_role_enum"    NOT NULL DEFAULT 'customer',
        "is_active"         boolean              NOT NULL DEFAULT false,
        "profile_completed" boolean              NOT NULL DEFAULT false,
        "last_login_at"     timestamptz,
        "deleted_at"        timestamptz,
        "created_at"        timestamptz          NOT NULL DEFAULT now(),
        "updated_at"        timestamptz          NOT NULL DEFAULT now(),
        CONSTRAINT "PK_users_id"          PRIMARY KEY ("id"),
        CONSTRAINT "UQ_users_email"       UNIQUE ("email"),
        CONSTRAINT "UQ_users_phone_number" UNIQUE ("phone_number")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "otp_codes" (
        "id"           uuid        NOT NULL DEFAULT gen_random_uuid(),
        "phone_number" text        NOT NULL,
        "otp_hash"     text        NOT NULL,
        "attempts"     integer     NOT NULL DEFAULT 0,
        "expires_at"   timestamptz NOT NULL,
        "verified"     boolean     NOT NULL DEFAULT false,
        "created_at"   timestamptz NOT NULL DEFAULT now(),
        "updated_at"   timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_otp_codes_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "categories" (
        "id"              uuid        NOT NULL DEFAULT gen_random_uuid(),
        "parent_id"       uuid,
        "name"            text        NOT NULL,
        "slug"            text        NOT NULL,
        "description"     text,
        "image"           text,
        "icon"            text,
        "color"           text,
        "sort_order"      integer     NOT NULL DEFAULT 0,
        "seo_title"       text,
        "seo_description" text,
        "is_active"       boolean     NOT NULL DEFAULT true,
        "created_at"      timestamptz NOT NULL DEFAULT now(),
        "updated_at"      timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_categories_id"   PRIMARY KEY ("id"),
        CONSTRAINT "UQ_categories_slug" UNIQUE ("slug")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "brands" (
        "id"          uuid        NOT NULL DEFAULT gen_random_uuid(),
        "name"        text        NOT NULL,
        "slug"        text        NOT NULL,
        "logo"        text,
        "description" text,
        "is_active"   boolean     NOT NULL DEFAULT true,
        "created_at"  timestamptz NOT NULL DEFAULT now(),
        "updated_at"  timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_brands_id"   PRIMARY KEY ("id"),
        CONSTRAINT "UQ_brands_name" UNIQUE ("name"),
        CONSTRAINT "UQ_brands_slug" UNIQUE ("slug")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "attributes" (
        "id"         uuid               NOT NULL DEFAULT gen_random_uuid(),
        "name"       text               NOT NULL,
        "type"       character varying  NOT NULL DEFAULT 'text',
        "created_at" timestamptz        NOT NULL DEFAULT now(),
        "updated_at" timestamptz        NOT NULL DEFAULT now(),
        CONSTRAINT "PK_attributes_id"   PRIMARY KEY ("id"),
        CONSTRAINT "UQ_attributes_name" UNIQUE ("name")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "tags" (
        "id"         uuid        NOT NULL DEFAULT gen_random_uuid(),
        "name"       text        NOT NULL,
        "slug"       text        NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_tags_id"   PRIMARY KEY ("id"),
        CONSTRAINT "UQ_tags_name" UNIQUE ("name"),
        CONSTRAINT "UQ_tags_slug" UNIQUE ("slug")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "coupons" (
        "id"               uuid                 NOT NULL DEFAULT gen_random_uuid(),
        "code"             text                 NOT NULL,
        "type"             "coupons_type_enum"  NOT NULL,
        "value"            numeric(12,2)        NOT NULL,
        "min_order_amount" numeric,
        "max_discount"     numeric,
        "usage_limit"      integer,
        "usage_per_user"   integer,
        "starts_at"        timestamptz          NOT NULL,
        "expires_at"       timestamptz          NOT NULL,
        "is_active"        boolean              NOT NULL DEFAULT true,
        "created_at"       timestamptz          NOT NULL DEFAULT now(),
        "updated_at"       timestamptz          NOT NULL DEFAULT now(),
        CONSTRAINT "PK_coupons_id"   PRIMARY KEY ("id"),
        CONSTRAINT "UQ_coupons_code" UNIQUE ("code")
      )
    `);

    // ── Tables that depend on users ───────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "user_addresses" (
        "id"                  uuid        NOT NULL DEFAULT gen_random_uuid(),
        "user_id"             uuid        NOT NULL,
        "full_name"           text        NOT NULL,
        "phone"               text        NOT NULL,
        "country"             text        NOT NULL,
        "state"               text        NOT NULL,
        "city"                text        NOT NULL,
        "address_line_1"      text        NOT NULL,
        "address_line_2"      text,
        "postal_code"         text        NOT NULL,
        "is_default_shipping" boolean     NOT NULL DEFAULT false,
        "is_default_billing"  boolean     NOT NULL DEFAULT false,
        "created_at"          timestamptz NOT NULL DEFAULT now(),
        "updated_at"          timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_addresses_id"      PRIMARY KEY ("id"),
        CONSTRAINT "FK_user_addresses_user_id" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "refresh_tokens" (
        "id"           uuid        NOT NULL DEFAULT gen_random_uuid(),
        "user_id"      uuid        NOT NULL,
        "token_hash"   text        NOT NULL,
        "ip_address"   text,
        "user_agent"   text,
        "revoked"      boolean     NOT NULL DEFAULT false,
        "revoked_at"   timestamptz,
        "expires_at"   timestamptz NOT NULL,
        "last_used_at" timestamptz,
        "created_at"   timestamptz NOT NULL DEFAULT now(),
        "updated_at"   timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_refresh_tokens_id"      PRIMARY KEY ("id"),
        CONSTRAINT "FK_refresh_tokens_user_id" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "login_logs" (
        "id"           uuid        NOT NULL DEFAULT gen_random_uuid(),
        "user_id"      uuid        NOT NULL,
        "ip_address"   text,
        "user_agent"   text,
        "logged_in_at" timestamptz NOT NULL,
        "created_at"   timestamptz NOT NULL DEFAULT now(),
        "updated_at"   timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_login_logs_id"      PRIMARY KEY ("id"),
        CONSTRAINT "FK_login_logs_user_id" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE
      )
    `);

    // ── attribute_values ──────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "attribute_values" (
        "id"           uuid        NOT NULL DEFAULT gen_random_uuid(),
        "attribute_id" uuid        NOT NULL,
        "value"        text        NOT NULL,
        "color_code"   text,
        "sort_order"   integer     NOT NULL DEFAULT 0,
        "created_at"   timestamptz NOT NULL DEFAULT now(),
        "updated_at"   timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_attribute_values_id"           PRIMARY KEY ("id"),
        CONSTRAINT "UQ_attribute_values_attr_value"   UNIQUE ("attribute_id", "value"),
        CONSTRAINT "FK_attribute_values_attribute_id" FOREIGN KEY ("attribute_id") REFERENCES "attributes" ("id") ON DELETE CASCADE
      )
    `);

    // ── products and dependents ───────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "products" (
        "id"                uuid        NOT NULL DEFAULT gen_random_uuid(),
        "category_id"       uuid        NOT NULL,
        "brand_id"          uuid,
        "title"             text        NOT NULL,
        "slug"              text        NOT NULL,
        "short_description" text,
        "full_description"  text,
        "specification"     jsonb,
        "seo_title"         text,
        "seo_description"   text,
        "is_active"         boolean     NOT NULL DEFAULT false,
        "is_public"         boolean     NOT NULL DEFAULT false,
        "deleted_at"        timestamptz,
        "created_at"        timestamptz NOT NULL DEFAULT now(),
        "updated_at"        timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_products_id"          PRIMARY KEY ("id"),
        CONSTRAINT "UQ_products_slug"        UNIQUE ("slug"),
        CONSTRAINT "FK_products_category_id" FOREIGN KEY ("category_id") REFERENCES "categories" ("id") ON DELETE RESTRICT,
        CONSTRAINT "FK_products_brand_id"    FOREIGN KEY ("brand_id")    REFERENCES "brands"     ("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "product_tags" (
        "id"         uuid        NOT NULL DEFAULT gen_random_uuid(),
        "product_id" uuid        NOT NULL,
        "tag_id"     uuid        NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_product_tags_id"      PRIMARY KEY ("id"),
        CONSTRAINT "uq_product_tag"          UNIQUE ("product_id", "tag_id"),
        CONSTRAINT "FK_product_tags_product_id" FOREIGN KEY ("product_id") REFERENCES "products" ("id") ON DELETE CASCADE,
        CONSTRAINT "FK_product_tags_tag_id"     FOREIGN KEY ("tag_id")     REFERENCES "tags"     ("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "product_images" (
        "id"           uuid        NOT NULL DEFAULT gen_random_uuid(),
        "product_id"   uuid        NOT NULL,
        "image_url"    text        NOT NULL,
        "alt_text"     text,
        "sort_order"   integer     NOT NULL DEFAULT 0,
        "is_thumbnail" boolean     NOT NULL DEFAULT false,
        "created_at"   timestamptz NOT NULL DEFAULT now(),
        "updated_at"   timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_product_images_id"         PRIMARY KEY ("id"),
        CONSTRAINT "FK_product_images_product_id" FOREIGN KEY ("product_id") REFERENCES "products" ("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "product_variants" (
        "id"                  uuid          NOT NULL DEFAULT gen_random_uuid(),
        "product_id"          uuid          NOT NULL,
        "sku"                 text          NOT NULL,
        "barcode"             text,
        "price"               numeric(12,2) NOT NULL,
        "compare_at_price"    numeric(12,2),
        "cost"                numeric(12,2) NOT NULL DEFAULT 0,
        "weight"              numeric(12,2),
        "stock_quantity"      integer       NOT NULL DEFAULT 0,
        "low_stock_threshold" integer,
        "is_active"           boolean       NOT NULL DEFAULT true,
        "deleted_at"          timestamptz,
        "created_at"          timestamptz   NOT NULL DEFAULT now(),
        "updated_at"          timestamptz   NOT NULL DEFAULT now(),
        CONSTRAINT "PK_product_variants_id"          PRIMARY KEY ("id"),
        CONSTRAINT "UQ_product_variants_sku"         UNIQUE ("sku"),
        CONSTRAINT "FK_product_variants_product_id"  FOREIGN KEY ("product_id") REFERENCES "products" ("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "variant_attribute_values" (
        "id"                 uuid        NOT NULL DEFAULT gen_random_uuid(),
        "variant_id"         uuid        NOT NULL,
        "attribute_value_id" uuid        NOT NULL,
        "created_at"         timestamptz NOT NULL DEFAULT now(),
        "updated_at"         timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_variant_attribute_values_id"                  PRIMARY KEY ("id"),
        CONSTRAINT "FK_variant_attribute_values_variant_id"          FOREIGN KEY ("variant_id")         REFERENCES "product_variants"  ("id") ON DELETE CASCADE,
        CONSTRAINT "FK_variant_attribute_values_attribute_value_id"  FOREIGN KEY ("attribute_value_id") REFERENCES "attribute_values"  ("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "variant_images" (
        "id"         uuid        NOT NULL DEFAULT gen_random_uuid(),
        "variant_id" uuid        NOT NULL,
        "image_url"  text        NOT NULL,
        "sort_order" integer     NOT NULL DEFAULT 0,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_variant_images_id"         PRIMARY KEY ("id"),
        CONSTRAINT "FK_variant_images_variant_id" FOREIGN KEY ("variant_id") REFERENCES "product_variants" ("id") ON DELETE CASCADE
      )
    `);

    // ── Coupon restriction tables ─────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "coupon_products" (
        "id"         uuid        NOT NULL DEFAULT gen_random_uuid(),
        "coupon_id"  uuid        NOT NULL,
        "product_id" uuid        NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_coupon_products_id"          PRIMARY KEY ("id"),
        CONSTRAINT "uq_coupon_product"              UNIQUE ("coupon_id", "product_id"),
        CONSTRAINT "FK_coupon_products_coupon_id"   FOREIGN KEY ("coupon_id")  REFERENCES "coupons"  ("id") ON DELETE CASCADE,
        CONSTRAINT "FK_coupon_products_product_id"  FOREIGN KEY ("product_id") REFERENCES "products" ("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "coupon_categories" (
        "id"          uuid        NOT NULL DEFAULT gen_random_uuid(),
        "coupon_id"   uuid        NOT NULL,
        "category_id" uuid        NOT NULL,
        "created_at"  timestamptz NOT NULL DEFAULT now(),
        "updated_at"  timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_coupon_categories_id"           PRIMARY KEY ("id"),
        CONSTRAINT "uq_coupon_category"                UNIQUE ("coupon_id", "category_id"),
        CONSTRAINT "FK_coupon_categories_coupon_id"    FOREIGN KEY ("coupon_id")   REFERENCES "coupons"    ("id") ON DELETE CASCADE,
        CONSTRAINT "FK_coupon_categories_category_id"  FOREIGN KEY ("category_id") REFERENCES "categories" ("id") ON DELETE CASCADE
      )
    `);

    // ── Cart ──────────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "carts" (
        "id"         uuid        NOT NULL DEFAULT gen_random_uuid(),
        "user_id"    uuid        UNIQUE,
        "session_id" text        UNIQUE,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_carts_id"      PRIMARY KEY ("id"),
        CONSTRAINT "FK_carts_user_id" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "cart_items" (
        "id"         uuid        NOT NULL DEFAULT gen_random_uuid(),
        "cart_id"    uuid        NOT NULL,
        "variant_id" uuid        NOT NULL,
        "quantity"   integer     NOT NULL DEFAULT 1,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_cart_items_id"          PRIMARY KEY ("id"),
        CONSTRAINT "uq_cart_variant"           UNIQUE ("cart_id", "variant_id"),
        CONSTRAINT "FK_cart_items_cart_id"     FOREIGN KEY ("cart_id")    REFERENCES "carts"            ("id") ON DELETE CASCADE,
        CONSTRAINT "FK_cart_items_variant_id"  FOREIGN KEY ("variant_id") REFERENCES "product_variants" ("id") ON DELETE CASCADE
      )
    `);

    // ── Orders ────────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "orders" (
        "id"                        uuid                             NOT NULL DEFAULT gen_random_uuid(),
        "order_number"              text                             NOT NULL,
        "user_id"                   uuid,
        "currency_code"             text                             NOT NULL DEFAULT 'USD',
        "subtotal"                  numeric(12,2)                    NOT NULL DEFAULT 0,
        "discount_amount"           numeric(12,2)                    NOT NULL DEFAULT 0,
        "shipping_amount"           numeric(12,2)                    NOT NULL DEFAULT 0,
        "tax_amount"                numeric(12,2)                    NOT NULL DEFAULT 0,
        "total_amount"              numeric(12,2)                    NOT NULL DEFAULT 0,
        "paid_amount"               numeric(12,2)                    NOT NULL DEFAULT 0,
        "due_amount"                numeric(12,2)                    NOT NULL DEFAULT 0,
        "payment_status"            "orders_payment_status_enum"     NOT NULL DEFAULT 'pending',
        "fulfillment_status"        "orders_fulfillment_status_enum" NOT NULL DEFAULT 'unfulfilled',
        "order_status"              "orders_order_status_enum"       NOT NULL DEFAULT 'pending',
        "coupon_id"                 uuid,
        "shipping_address_snapshot" jsonb                            NOT NULL,
        "billing_address_snapshot"  jsonb                            NOT NULL,
        "customer_email"            text                             NOT NULL,
        "customer_phone"            text                             NOT NULL,
        "customer_note"             text,
        "admin_note"                text,
        "placed_at"                 timestamptz,
        "created_at"                timestamptz                      NOT NULL DEFAULT now(),
        "updated_at"                timestamptz                      NOT NULL DEFAULT now(),
        CONSTRAINT "PK_orders_id"            PRIMARY KEY ("id"),
        CONSTRAINT "UQ_orders_order_number"  UNIQUE ("order_number"),
        CONSTRAINT "FK_orders_user_id"       FOREIGN KEY ("user_id")    REFERENCES "users"   ("id") ON DELETE SET NULL,
        CONSTRAINT "FK_orders_coupon_id"     FOREIGN KEY ("coupon_id")  REFERENCES "coupons" ("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "order_items" (
        "id"               uuid          NOT NULL DEFAULT gen_random_uuid(),
        "order_id"         uuid          NOT NULL,
        "variant_id"       uuid,
        "product_title"    text          NOT NULL,
        "variant_title"    text,
        "sku"              text          NOT NULL,
        "quantity"         integer       NOT NULL,
        "unit_price"       numeric(12,2) NOT NULL,
        "discount_amount"  numeric(12,2) NOT NULL DEFAULT 0,
        "tax_amount"       numeric(12,2) NOT NULL DEFAULT 0,
        "total_amount"     numeric(12,2) NOT NULL,
        "product_snapshot" jsonb         NOT NULL,
        "created_at"       timestamptz   NOT NULL DEFAULT now(),
        "updated_at"       timestamptz   NOT NULL DEFAULT now(),
        CONSTRAINT "PK_order_items_id"          PRIMARY KEY ("id"),
        CONSTRAINT "FK_order_items_order_id"    FOREIGN KEY ("order_id")    REFERENCES "orders"           ("id") ON DELETE CASCADE,
        CONSTRAINT "FK_order_items_variant_id"  FOREIGN KEY ("variant_id")  REFERENCES "product_variants" ("id") ON DELETE SET NULL
      )
    `);

    // ── Payments ──────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "payments" (
        "id"               uuid                   NOT NULL DEFAULT gen_random_uuid(),
        "order_id"         uuid                   NOT NULL,
        "provider"         text                   NOT NULL,
        "method"           text                   NOT NULL,
        "transaction_id"   text,
        "amount"           numeric(12,2)          NOT NULL,
        "currency_code"    text                   NOT NULL,
        "status"           "payments_status_enum" NOT NULL,
        "gateway_response" jsonb,
        "paid_at"          timestamptz,
        "refunded_at"      timestamptz,
        "refund_amount"    numeric,
        "created_at"       timestamptz            NOT NULL DEFAULT now(),
        "updated_at"       timestamptz            NOT NULL DEFAULT now(),
        CONSTRAINT "PK_payments_id"         PRIMARY KEY ("id"),
        CONSTRAINT "FK_payments_order_id"   FOREIGN KEY ("order_id") REFERENCES "orders" ("id") ON DELETE CASCADE
      )
    `);

    // ── Shipments ─────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "shipments" (
        "id"                    uuid                    NOT NULL DEFAULT gen_random_uuid(),
        "order_id"              uuid                    NOT NULL,
        "tracking_number"       text                    NOT NULL,
        "courier_name"          text                    NOT NULL,
        "tracking_url"          text,
        "status"                "shipments_status_enum" NOT NULL DEFAULT 'pending',
        "shipped_at"            timestamptz,
        "delivered_at"          timestamptz,
        "estimated_delivery_at" timestamptz,
        "notes"                 text,
        "created_at"            timestamptz             NOT NULL DEFAULT now(),
        "updated_at"            timestamptz             NOT NULL DEFAULT now(),
        CONSTRAINT "PK_shipments_id"                 PRIMARY KEY ("id"),
        CONSTRAINT "UQ_shipments_tracking_number"    UNIQUE ("tracking_number"),
        CONSTRAINT "FK_shipments_order_id"           FOREIGN KEY ("order_id") REFERENCES "orders" ("id") ON DELETE CASCADE
      )
    `);

    // ── Returns ───────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "returns" (
        "id"            uuid                  NOT NULL DEFAULT gen_random_uuid(),
        "order_id"      uuid                  NOT NULL,
        "user_id"       uuid                  NOT NULL,
        "return_number" text                  NOT NULL,
        "reason"        text                  NOT NULL,
        "status"        "returns_status_enum" NOT NULL DEFAULT 'pending',
        "refund_amount" numeric(12,2)         NOT NULL DEFAULT 0,
        "admin_note"    text,
        "created_at"    timestamptz           NOT NULL DEFAULT now(),
        "updated_at"    timestamptz           NOT NULL DEFAULT now(),
        CONSTRAINT "PK_returns_id"             PRIMARY KEY ("id"),
        CONSTRAINT "UQ_returns_return_number"  UNIQUE ("return_number"),
        CONSTRAINT "FK_returns_order_id"       FOREIGN KEY ("order_id") REFERENCES "orders" ("id") ON DELETE CASCADE,
        CONSTRAINT "FK_returns_user_id"        FOREIGN KEY ("user_id")  REFERENCES "users"  ("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "return_items" (
        "id"            uuid        NOT NULL DEFAULT gen_random_uuid(),
        "return_id"     uuid        NOT NULL,
        "order_item_id" uuid        NOT NULL,
        "quantity"      integer     NOT NULL,
        "reason"        text,
        "created_at"    timestamptz NOT NULL DEFAULT now(),
        "updated_at"    timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_return_items_id"              PRIMARY KEY ("id"),
        CONSTRAINT "FK_return_items_return_id"       FOREIGN KEY ("return_id")     REFERENCES "returns"     ("id") ON DELETE CASCADE,
        CONSTRAINT "FK_return_items_order_item_id"   FOREIGN KEY ("order_item_id") REFERENCES "order_items" ("id") ON DELETE CASCADE
      )
    `);

    // ── Reviews ───────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "reviews" (
        "id"                uuid        NOT NULL DEFAULT gen_random_uuid(),
        "product_id"        uuid        NOT NULL,
        "user_id"           uuid        NOT NULL,
        "rating"            integer     NOT NULL,
        "title"             text,
        "comment"           text,
        "verified_purchase" boolean     NOT NULL DEFAULT false,
        "helpful_count"     integer     NOT NULL DEFAULT 0,
        "is_approved"       boolean     NOT NULL DEFAULT false,
        "admin_reply"       text,
        "replied_at"        timestamptz,
        "created_at"        timestamptz NOT NULL DEFAULT now(),
        "updated_at"        timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_reviews_id"          PRIMARY KEY ("id"),
        CONSTRAINT "uq_user_product"        UNIQUE ("user_id", "product_id"),
        CONSTRAINT "FK_reviews_product_id"  FOREIGN KEY ("product_id") REFERENCES "products" ("id") ON DELETE CASCADE,
        CONSTRAINT "FK_reviews_user_id"     FOREIGN KEY ("user_id")    REFERENCES "users"    ("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "review_helpful_votes" (
        "id"         uuid        NOT NULL DEFAULT gen_random_uuid(),
        "review_id"  uuid        NOT NULL,
        "user_id"    uuid        NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_review_helpful_votes_id"           PRIMARY KEY ("id"),
        CONSTRAINT "UQ_review_helpful_votes_review_user"  UNIQUE ("review_id", "user_id")
      )
    `);

    // ── Wishlists ─────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "wishlists" (
        "id"         uuid        NOT NULL DEFAULT gen_random_uuid(),
        "user_id"    uuid        NOT NULL,
        "variant_id" uuid        NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_wishlists_id"          PRIMARY KEY ("id"),
        CONSTRAINT "uq_user_variant"          UNIQUE ("user_id", "variant_id"),
        CONSTRAINT "FK_wishlists_user_id"     FOREIGN KEY ("user_id")    REFERENCES "users"            ("id") ON DELETE CASCADE,
        CONSTRAINT "FK_wishlists_variant_id"  FOREIGN KEY ("variant_id") REFERENCES "product_variants" ("id") ON DELETE CASCADE
      )
    `);

    // ── Inventory logs ────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "inventory_logs" (
        "id"              uuid                       NOT NULL DEFAULT gen_random_uuid(),
        "variant_id"      uuid                       NOT NULL,
        "type"            "inventory_logs_type_enum" NOT NULL,
        "quantity_before" integer                    NOT NULL,
        "quantity_change" integer                    NOT NULL,
        "quantity_after"  integer                    NOT NULL,
        "reference_type"  text                       NOT NULL,
        "reference_id"    uuid,
        "note"            text,
        "created_by"      uuid,
        "created_at"      timestamptz                NOT NULL DEFAULT now(),
        "updated_at"      timestamptz                NOT NULL DEFAULT now(),
        CONSTRAINT "PK_inventory_logs_id"           PRIMARY KEY ("id"),
        CONSTRAINT "FK_inventory_logs_variant_id"   FOREIGN KEY ("variant_id") REFERENCES "product_variants" ("id") ON DELETE CASCADE,
        CONSTRAINT "FK_inventory_logs_created_by"   FOREIGN KEY ("created_by") REFERENCES "users"            ("id") ON DELETE SET NULL
      )
    `);

    // ── Self-referential FK on categories ────────────────────────────────────
    await queryRunner.query(`
      ALTER TABLE "categories"
        ADD CONSTRAINT "FK_categories_parent_id"
        FOREIGN KEY ("parent_id") REFERENCES "categories" ("id") ON DELETE SET NULL
    `);

    // ── Non-unique indexes ────────────────────────────────────────────────────
    await queryRunner.query(`CREATE INDEX "IDX_categories_parent_id"              ON "categories"         ("parent_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_products_category_id"              ON "products"           ("category_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_products_brand_id"                 ON "products"           ("brand_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_products_is_public"                ON "products"           ("is_public")`);
    await queryRunner.query(`CREATE INDEX "IDX_product_variants_product_id"       ON "product_variants"   ("product_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_product_variants_stock_quantity"   ON "product_variants"   ("stock_quantity")`);
    await queryRunner.query(`CREATE INDEX "IDX_otp_codes_phone_number"            ON "otp_codes"          ("phone_number")`);
    await queryRunner.query(`CREATE INDEX "IDX_refresh_tokens_user_id"            ON "refresh_tokens"     ("user_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_login_logs_user_id"                ON "login_logs"         ("user_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_orders_user_id"                    ON "orders"             ("user_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_orders_payment_status"             ON "orders"             ("payment_status")`);
    await queryRunner.query(`CREATE INDEX "IDX_orders_fulfillment_status"         ON "orders"             ("fulfillment_status")`);

    // ── Partial unique indexes ────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_payments_transaction_id"
        ON "payments" ("transaction_id")
        WHERE "transaction_id" IS NOT NULL
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "uq_user_default_shipping"
        ON "user_addresses" ("user_id", "is_default_shipping")
        WHERE "is_default_shipping" = true
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop partial unique indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "uq_user_default_shipping"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "UQ_payments_transaction_id"`);

    // Drop regular indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_orders_fulfillment_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_orders_payment_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_orders_user_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_login_logs_user_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_refresh_tokens_user_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_otp_codes_phone_number"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_product_variants_stock_quantity"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_product_variants_product_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_products_is_public"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_products_brand_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_products_category_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_categories_parent_id"`);

    // Drop tables (most dependent first)
    await queryRunner.query(`DROP TABLE IF EXISTS "inventory_logs"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "wishlists"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "review_helpful_votes"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "reviews"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "return_items"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "returns"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "shipments"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "payments"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "order_items"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "orders"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "cart_items"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "carts"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "coupon_categories"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "coupon_products"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "variant_images"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "variant_attribute_values"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "product_variants"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "product_images"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "product_tags"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "products"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "attribute_values"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "login_logs"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "refresh_tokens"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_addresses"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "coupons"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "tags"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "attributes"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "brands"`);

    // Drop self-referential FK before dropping categories
    await queryRunner.query(`ALTER TABLE "categories" DROP CONSTRAINT IF EXISTS "FK_categories_parent_id"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "categories"`);

    await queryRunner.query(`DROP TABLE IF EXISTS "otp_codes"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);

    // Drop enum types
    await queryRunner.query(`DROP TYPE IF EXISTS "inventory_logs_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "returns_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "shipments_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "payments_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "orders_order_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "orders_fulfillment_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "orders_payment_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "coupons_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "users_role_enum"`);
  }
}
