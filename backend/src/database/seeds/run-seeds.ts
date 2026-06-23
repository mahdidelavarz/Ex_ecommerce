// src/database/seeds/run-seeds.ts
//
// Seeds every table with realistic test data.
// Usage:
//   npm run seed:run
//
// The script TRUNCATEs all tables first, so it is safe to re-run. NEVER run
// against a production database — it wipes existing rows.
import { AppDataSource } from '../data-source';

import { User, UserRole } from '../entities/user.entity';
import { UserAddress } from '../entities/user-address.entity';
import { Category } from '../entities/category.entity';
import { Brand } from '../entities/brand.entity';
import { Tag } from '../entities/tag.entity';
import { Attribute, AttributeType } from '../entities/attribute.entity';
import { AttributeValue } from '../entities/attribute-value.entity';
import { Product } from '../entities/product.entity';
import { ProductImage } from '../entities/product-image.entity';
import { ProductTag } from '../entities/product-tag.entity';
import { ProductVariant } from '../entities/product-variant.entity';
import { VariantAttributeValue } from '../entities/variant-attribute-value.entity';
import { VariantImage } from '../entities/variant-image.entity';
import { Coupon, CouponType } from '../entities/coupon.entity';
import { CouponProduct } from '../entities/coupon-product.entity';
import { CouponCategory } from '../entities/coupon-category.entity';
import { Cart } from '../entities/cart.entity';
import { CartItem } from '../entities/cart-item.entity';
import {
  Order,
  OrderStatus,
  PaymentStatus,
  FulfillmentStatus,
} from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { Payment, PaymentStatusEnum } from '../entities/payment.entity';
import { Shipment, ShipmentStatus } from '../entities/shipment.entity';
import { Return, ReturnStatus } from '../entities/return.entity';
import { ReturnItem } from '../entities/return-item.entity';
import { Review } from '../entities/review.entity';
import { ReviewHelpfulVote } from '../entities/review-helpful-vote.entity';
import { Wishlist } from '../entities/wishlist.entity';
import { InventoryLog, InventoryLogType } from '../entities/inventory-log.entity';
import { LoginLog } from '../entities/login-log.entity';
import { RefreshToken } from '../entities/refresh-token.entity';
import { OtpCode } from '../entities/otp-code.entity';
import { AppSetting } from '../entities/app-setting.entity';

const daysFromNow = (n: number) => new Date(Date.now() + n * 24 * 60 * 60 * 1000);

async function truncateAll() {
  const tableNames = AppDataSource.entityMetadatas
    .map((m) => `"${m.tableName}"`)
    .join(', ');
  await AppDataSource.query(`TRUNCATE ${tableNames} RESTART IDENTITY CASCADE;`);
  console.log('🧹 Cleared all tables');
}

async function main() {
  await AppDataSource.initialize();
  console.log('✅ Database connected');

  await truncateAll();

  // ───────────────────────────────────────────── app settings
  const settingRepo = AppDataSource.getRepository(AppSetting);
  await settingRepo.save([
    { key: 'store_name', value: 'Nazi Shop', label: 'نام فروشگاه' },
    { key: 'currency', value: 'IRR', label: 'واحد پول' },
    { key: 'tax_rate', value: '9', label: 'نرخ مالیات (٪)' },
    { key: 'free_shipping_threshold', value: '5000000', label: 'سقف ارسال رایگان' },
    { key: 'support_phone', value: '02112345678', label: 'تلفن پشتیبانی' },
  ]);

  // ───────────────────────────────────────────── users
  const userRepo = AppDataSource.getRepository(User);
  const admin = await userRepo.save(
    userRepo.create({
      email: 'admin@nazishop.test',
      phone_number: '09120000001',
      full_name: 'مدیر سیستم',
      role: UserRole.ADMIN,
      is_active: true,
      profile_completed: true,
      last_login_at: new Date(),
    }),
  );
  const support = await userRepo.save(
    userRepo.create({
      email: 'support@nazishop.test',
      phone_number: '09120000002',
      full_name: 'کارشناس پشتیبانی',
      role: UserRole.SUPPORT,
      is_active: true,
      profile_completed: true,
    }),
  );
  const customer1 = await userRepo.save(
    userRepo.create({
      email: 'sara@example.test',
      phone_number: '09121111111',
      full_name: 'سارا احمدی',
      birthday: new Date('1995-04-12'),
      role: UserRole.CUSTOMER,
      is_active: true,
      profile_completed: true,
      last_login_at: new Date(),
    }),
  );
  const customer2 = await userRepo.save(
    userRepo.create({
      email: 'reza@example.test',
      phone_number: '09122222222',
      full_name: 'رضا کریمی',
      role: UserRole.CUSTOMER,
      is_active: true,
      profile_completed: false,
    }),
  );
  console.log('👤 Seeded users');

  // ───────────────────────────────────────────── addresses
  const addressRepo = AppDataSource.getRepository(UserAddress);
  await addressRepo.save([
    addressRepo.create({
      user_id: customer1.id,
      full_name: 'سارا احمدی',
      phone: '09121111111',
      country: 'ایران',
      state: 'تهران',
      city: 'تهران',
      address_line_1: 'خیابان ولیعصر، کوچه بهار، پلاک ۱۲',
      postal_code: '1234567890',
      is_default_shipping: true,
      is_default_billing: true,
    }),
    addressRepo.create({
      user_id: customer2.id,
      full_name: 'رضا کریمی',
      phone: '09122222222',
      country: 'ایران',
      state: 'اصفهان',
      city: 'اصفهان',
      address_line_1: 'خیابان چهارباغ، پلاک ۴۵',
      postal_code: '8134567890',
      is_default_shipping: true,
      is_default_billing: true,
    }),
  ]);
  console.log('🏠 Seeded addresses');

  // ───────────────────────────────────────────── categories (parent + children)
  const categoryRepo = AppDataSource.getRepository(Category);
  const catClothing = await categoryRepo.save(
    categoryRepo.create({ name: 'پوشاک', slug: 'clothing', sort_order: 1, color: '#e11d48' }),
  );
  const catElectronics = await categoryRepo.save(
    categoryRepo.create({ name: 'الکترونیک', slug: 'electronics', sort_order: 2, color: '#2563eb' }),
  );
  const catMen = await categoryRepo.save(
    categoryRepo.create({ name: 'مردانه', slug: 'men', parent_id: catClothing.id, sort_order: 1 }),
  );
  const catWomen = await categoryRepo.save(
    categoryRepo.create({ name: 'زنانه', slug: 'women', parent_id: catClothing.id, sort_order: 2 }),
  );
  const catPhones = await categoryRepo.save(
    categoryRepo.create({ name: 'موبایل', slug: 'phones', parent_id: catElectronics.id, sort_order: 1 }),
  );
  console.log('📂 Seeded categories');

  // ───────────────────────────────────────────── brands
  const brandRepo = AppDataSource.getRepository(Brand);
  const [brandNike, brandApple, brandZara] = await brandRepo.save([
    brandRepo.create({ name: 'Nike', slug: 'nike', description: 'ورزشی و کژوال' }),
    brandRepo.create({ name: 'Apple', slug: 'apple', description: 'محصولات دیجیتال' }),
    brandRepo.create({ name: 'Zara', slug: 'zara', description: 'مد روز' }),
  ]);
  console.log('🏷️  Seeded brands');

  // ───────────────────────────────────────────── tags
  const tagRepo = AppDataSource.getRepository(Tag);
  const [tagNew, tagSale, tagPopular, tagSummer] = await tagRepo.save([
    tagRepo.create({ name: 'جدید', slug: 'new' }),
    tagRepo.create({ name: 'حراج', slug: 'sale' }),
    tagRepo.create({ name: 'پرفروش', slug: 'popular' }),
    tagRepo.create({ name: 'تابستانه', slug: 'summer' }),
  ]);
  console.log('🔖 Seeded tags');

  // ───────────────────────────────────────────── attributes & values
  const attrRepo = AppDataSource.getRepository(Attribute);
  const valueRepo = AppDataSource.getRepository(AttributeValue);
  const attrColor = await attrRepo.save(
    attrRepo.create({ name: 'رنگ', type: AttributeType.COLOR }),
  );
  const attrSize = await attrRepo.save(
    attrRepo.create({ name: 'سایز', type: AttributeType.SIZE }),
  );
  const [colorBlack, colorWhite, colorRed] = await valueRepo.save([
    valueRepo.create({ attribute_id: attrColor.id, value: 'مشکی', color_code: '#000000', sort_order: 1 }),
    valueRepo.create({ attribute_id: attrColor.id, value: 'سفید', color_code: '#ffffff', sort_order: 2 }),
    valueRepo.create({ attribute_id: attrColor.id, value: 'قرمز', color_code: '#ef4444', sort_order: 3 }),
  ]);
  const [sizeM, sizeL] = await valueRepo.save([
    valueRepo.create({ attribute_id: attrSize.id, value: 'M', sort_order: 1 }),
    valueRepo.create({ attribute_id: attrSize.id, value: 'L', sort_order: 2 }),
  ]);
  console.log('🎨 Seeded attributes & values');

  // ───────────────────────────────────────────── products + images + tags + variants
  const productRepo = AppDataSource.getRepository(Product);
  const imageRepo = AppDataSource.getRepository(ProductImage);
  const productTagRepo = AppDataSource.getRepository(ProductTag);
  const variantRepo = AppDataSource.getRepository(ProductVariant);
  const vavRepo = AppDataSource.getRepository(VariantAttributeValue);
  const variantImageRepo = AppDataSource.getRepository(VariantImage);

  type SeededVariant = ProductVariant;
  const allVariants: SeededVariant[] = [];

  const productDefs = [
    {
      title: 'تیشرت نخی مردانه',
      slug: 'mens-cotton-tshirt',
      category_id: catMen.id,
      brand_id: brandNike.id,
      short_description: 'تیشرت نخی با کیفیت بالا',
      tags: [tagNew.id, tagPopular.id],
      variants: [
        { sku: 'TSHIRT-BLK-M', price: 850000, compare_at_price: 1000000, stock: 25, color: colorBlack.id, size: sizeM.id },
        { sku: 'TSHIRT-WHT-L', price: 850000, compare_at_price: 1000000, stock: 14, color: colorWhite.id, size: sizeL.id },
      ],
    },
    {
      title: 'مانتو زنانه تابستانه',
      slug: 'womens-summer-coat',
      category_id: catWomen.id,
      brand_id: brandZara.id,
      short_description: 'مانتو سبک و خنک مناسب تابستان',
      tags: [tagSummer.id, tagSale.id],
      variants: [
        { sku: 'COAT-RED-M', price: 2400000, compare_at_price: 3000000, stock: 8, color: colorRed.id, size: sizeM.id },
        { sku: 'COAT-BLK-L', price: 2400000, compare_at_price: null, stock: 0, color: colorBlack.id, size: sizeL.id },
      ],
    },
    {
      title: 'آیفون ۱۵ پرو',
      slug: 'iphone-15-pro',
      category_id: catPhones.id,
      brand_id: brandApple.id,
      short_description: 'پرچمدار اپل با تراشه A17',
      tags: [tagNew.id, tagPopular.id],
      variants: [
        { sku: 'IP15PRO-BLK', price: 95000000, compare_at_price: null, stock: 5, color: colorBlack.id, size: null },
        { sku: 'IP15PRO-WHT', price: 95000000, compare_at_price: null, stock: 3, color: colorWhite.id, size: null },
      ],
    },
  ];

  for (const def of productDefs) {
    const product = await productRepo.save(
      productRepo.create({
        category_id: def.category_id,
        brand_id: def.brand_id,
        title: def.title,
        slug: def.slug,
        short_description: def.short_description,
        full_description: `${def.title} — توضیحات کامل محصول برای تست.`,
        specification: { 'جنس': 'نخ پنبه', 'کشور سازنده': 'ایران' },
        seo_title: def.title,
        is_active: true,
        is_public: true,
      }),
    );

    await imageRepo.save([
      imageRepo.create({
        product_id: product.id,
        image_url: `https://placehold.co/600x600/png?text=${def.slug}-1`,
        alt_text: def.title,
        sort_order: 0,
        is_thumbnail: true,
      }),
      imageRepo.create({
        product_id: product.id,
        image_url: `https://placehold.co/600x600/png?text=${def.slug}-2`,
        alt_text: def.title,
        sort_order: 1,
      }),
    ]);

    await productTagRepo.save(
      def.tags.map((tagId) => productTagRepo.create({ product_id: product.id, tag_id: tagId })),
    );

    for (const v of def.variants) {
      const variant = await variantRepo.save(
        variantRepo.create({
          product_id: product.id,
          sku: v.sku,
          barcode: `BAR-${v.sku}`,
          price: v.price,
          compare_at_price: v.compare_at_price,
          cost: Math.round(v.price * 0.6),
          weight: 0.5,
          stock_quantity: v.stock,
          low_stock_threshold: 5,
          is_active: true,
        }),
      );
      allVariants.push(variant);

      const linkValues = [v.color, v.size].filter(Boolean) as string[];
      await vavRepo.save(
        linkValues.map((avId) =>
          vavRepo.create({ variant_id: variant.id, attribute_value_id: avId }),
        ),
      );

      await variantImageRepo.save(
        variantImageRepo.create({
          variant_id: variant.id,
          image_url: `https://placehold.co/400x400/png?text=${v.sku}`,
          sort_order: 0,
        }),
      );
    }
  }
  console.log('📦 Seeded products, images, tags, variants');

  const tshirtVariant = allVariants[0];
  const coatVariant = allVariants[2];
  const iphoneVariant = allVariants[4];

  // ───────────────────────────────────────────── coupons
  const couponRepo = AppDataSource.getRepository(Coupon);
  const couponProductRepo = AppDataSource.getRepository(CouponProduct);
  const couponCategoryRepo = AppDataSource.getRepository(CouponCategory);
  const couponPercent = await couponRepo.save(
    couponRepo.create({
      code: 'WELCOME10',
      type: CouponType.PERCENTAGE,
      value: 10,
      min_order_amount: 1000000,
      max_discount: 2000000,
      usage_limit: 100,
      usage_per_user: 1,
      starts_at: daysFromNow(-7),
      expires_at: daysFromNow(30),
      is_active: true,
    }),
  );
  const couponFixed = await couponRepo.save(
    couponRepo.create({
      code: 'OFF500K',
      type: CouponType.FIXED,
      value: 500000,
      min_order_amount: 2000000,
      starts_at: daysFromNow(-1),
      expires_at: daysFromNow(14),
      is_active: true,
    }),
  );
  await couponRepo.save(
    couponRepo.create({
      code: 'FREESHIP',
      type: CouponType.FREE_SHIPPING,
      value: 0,
      starts_at: daysFromNow(-1),
      expires_at: daysFromNow(60),
      is_active: true,
    }),
  );
  await couponProductRepo.save(
    couponProductRepo.create({ coupon_id: couponPercent.id, product_id: tshirtVariant.product_id }),
  );
  await couponCategoryRepo.save(
    couponCategoryRepo.create({ coupon_id: couponFixed.id, category_id: catClothing.id }),
  );
  console.log('🎟️  Seeded coupons');

  // ───────────────────────────────────────────── carts + items
  const cartRepo = AppDataSource.getRepository(Cart);
  const cartItemRepo = AppDataSource.getRepository(CartItem);
  const cart1 = await cartRepo.save(cartRepo.create({ user_id: customer1.id }));
  await cartItemRepo.save([
    cartItemRepo.create({ cart_id: cart1.id, variant_id: tshirtVariant.id, quantity: 2 }),
    cartItemRepo.create({ cart_id: cart1.id, variant_id: iphoneVariant.id, quantity: 1 }),
  ]);
  // guest cart (session-based)
  const guestCart = await cartRepo.save(cartRepo.create({ session_id: 'guest-session-abc123' }));
  await cartItemRepo.save(
    cartItemRepo.create({ cart_id: guestCart.id, variant_id: coatVariant.id, quantity: 1 }),
  );
  console.log('🛒 Seeded carts');

  // ───────────────────────────────────────────── orders + items + payment + shipment
  const orderRepo = AppDataSource.getRepository(Order);
  const orderItemRepo = AppDataSource.getRepository(OrderItem);
  const paymentRepo = AppDataSource.getRepository(Payment);
  const shipmentRepo = AppDataSource.getRepository(Shipment);

  const addressSnapshot = {
    full_name: 'سارا احمدی',
    phone: '09121111111',
    country: 'ایران',
    state: 'تهران',
    city: 'تهران',
    address_line_1: 'خیابان ولیعصر، کوچه بهار، پلاک ۱۲',
    postal_code: '1234567890',
  };

  // Order 1 — delivered & paid
  const order1Subtotal = 1700000; // 2 x tshirt 850k
  const order1Discount = 170000;
  const order1Shipping = 200000;
  const order1Tax = 153000;
  const order1Total = order1Subtotal - order1Discount + order1Shipping + order1Tax;
  const order1 = await orderRepo.save(
    orderRepo.create({
      order_number: 'ORD-1001',
      user_id: customer1.id,
      currency_code: 'IRR',
      subtotal: order1Subtotal,
      discount_amount: order1Discount,
      shipping_amount: order1Shipping,
      tax_amount: order1Tax,
      total_amount: order1Total,
      paid_amount: order1Total,
      due_amount: 0,
      payment_status: PaymentStatus.PAID,
      fulfillment_status: FulfillmentStatus.FULFILLED,
      order_status: OrderStatus.DELIVERED,
      coupon_id: couponPercent.id,
      shipping_address_snapshot: addressSnapshot,
      billing_address_snapshot: addressSnapshot,
      customer_email: 'sara@example.test',
      customer_phone: '09121111111',
      customer_note: 'لطفا سریع ارسال شود',
      placed_at: daysFromNow(-10),
    }),
  );
  const order1Item = await orderItemRepo.save(
    orderItemRepo.create({
      order_id: order1.id,
      variant_id: tshirtVariant.id,
      product_title: 'تیشرت نخی مردانه',
      variant_title: 'مشکی / M',
      sku: tshirtVariant.sku,
      quantity: 2,
      unit_price: 850000,
      discount_amount: order1Discount,
      tax_amount: order1Tax,
      total_amount: order1Subtotal - order1Discount,
      product_snapshot: { title: 'تیشرت نخی مردانه', sku: tshirtVariant.sku, price: 850000 },
    }),
  );
  await paymentRepo.save(
    paymentRepo.create({
      order_id: order1.id,
      provider: 'zarinpal',
      method: 'online',
      transaction_id: 'TXN-ZP-1001',
      amount: order1Total,
      currency_code: 'IRR',
      status: PaymentStatusEnum.COMPLETED,
      gateway_response: { ref_id: 'A123456789', card_pan: '6037****1234' },
      paid_at: daysFromNow(-10),
    }),
  );
  await shipmentRepo.save(
    shipmentRepo.create({
      order_id: order1.id,
      tracking_number: 'TRK-1001',
      courier_name: 'پست پیشتاز',
      tracking_url: 'https://tracking.post.ir/TRK-1001',
      status: ShipmentStatus.DELIVERED,
      shipped_at: daysFromNow(-9),
      delivered_at: daysFromNow(-7),
      estimated_delivery_at: daysFromNow(-7),
    }),
  );

  // Order 2 — pending payment
  const order2Total = 95000000;
  const order2 = await orderRepo.save(
    orderRepo.create({
      order_number: 'ORD-1002',
      user_id: customer2.id,
      currency_code: 'IRR',
      subtotal: order2Total,
      total_amount: order2Total,
      due_amount: order2Total,
      payment_status: PaymentStatus.PENDING,
      fulfillment_status: FulfillmentStatus.UNFULFILLED,
      order_status: OrderStatus.PENDING,
      shipping_address_snapshot: addressSnapshot,
      billing_address_snapshot: addressSnapshot,
      customer_email: 'reza@example.test',
      customer_phone: '09122222222',
      placed_at: daysFromNow(-1),
    }),
  );
  await orderItemRepo.save(
    orderItemRepo.create({
      order_id: order2.id,
      variant_id: iphoneVariant.id,
      product_title: 'آیفون ۱۵ پرو',
      variant_title: 'مشکی',
      sku: iphoneVariant.sku,
      quantity: 1,
      unit_price: 95000000,
      total_amount: 95000000,
      product_snapshot: { title: 'آیفون ۱۵ پرو', sku: iphoneVariant.sku, price: 95000000 },
    }),
  );
  await paymentRepo.save(
    paymentRepo.create({
      order_id: order2.id,
      provider: 'zarinpal',
      method: 'online',
      amount: order2Total,
      currency_code: 'IRR',
      status: PaymentStatusEnum.PENDING,
    }),
  );
  console.log('🧾 Seeded orders, items, payments, shipments');

  // ───────────────────────────────────────────── returns + items
  const returnRepo = AppDataSource.getRepository(Return);
  const returnItemRepo = AppDataSource.getRepository(ReturnItem);
  const return1 = await returnRepo.save(
    returnRepo.create({
      order_id: order1.id,
      user_id: customer1.id,
      return_number: 'RET-2001',
      reason: 'سایز مناسب نبود',
      status: ReturnStatus.APPROVED,
      refund_amount: 850000,
      admin_note: 'مرجوعی تایید شد',
    }),
  );
  await returnItemRepo.save(
    returnItemRepo.create({
      return_id: return1.id,
      order_item_id: order1Item.id,
      quantity: 1,
      reason: 'سایز بزرگ بود',
    }),
  );
  console.log('↩️  Seeded returns');

  // ───────────────────────────────────────────── reviews + helpful votes
  const reviewRepo = AppDataSource.getRepository(Review);
  const voteRepo = AppDataSource.getRepository(ReviewHelpfulVote);
  const review1 = await reviewRepo.save(
    reviewRepo.create({
      product_id: tshirtVariant.product_id,
      user_id: customer1.id,
      rating: 5,
      title: 'عالی بود',
      comment: 'کیفیت پارچه خیلی خوبه، پیشنهاد می‌کنم',
      verified_purchase: true,
      helpful_count: 1,
      is_approved: true,
      admin_reply: 'ممنون از خرید شما',
      replied_at: new Date(),
    }),
  );
  await reviewRepo.save(
    reviewRepo.create({
      product_id: iphoneVariant.product_id,
      user_id: customer2.id,
      rating: 4,
      title: 'خوب ولی گران',
      comment: 'گوشی فوق‌العاده‌ایه اما قیمتش بالاست',
      verified_purchase: false,
      is_approved: true,
    }),
  );
  await voteRepo.save(
    voteRepo.create({ review_id: review1.id, user_id: customer2.id }),
  );
  console.log('⭐ Seeded reviews');

  // ───────────────────────────────────────────── wishlists
  const wishlistRepo = AppDataSource.getRepository(Wishlist);
  await wishlistRepo.save([
    wishlistRepo.create({ user_id: customer1.id, variant_id: iphoneVariant.id }),
    wishlistRepo.create({ user_id: customer2.id, variant_id: tshirtVariant.id }),
  ]);
  console.log('💖 Seeded wishlists');

  // ───────────────────────────────────────────── inventory logs
  const invLogRepo = AppDataSource.getRepository(InventoryLog);
  await invLogRepo.save([
    invLogRepo.create({
      variant_id: tshirtVariant.id,
      type: InventoryLogType.STOCK_IMPORT,
      quantity_before: 0,
      quantity_change: 27,
      quantity_after: 27,
      reference_type: 'manual',
      note: 'موجودی اولیه',
      created_by: admin.id,
    }),
    invLogRepo.create({
      variant_id: tshirtVariant.id,
      type: InventoryLogType.ORDER_PLACED,
      quantity_before: 27,
      quantity_change: -2,
      quantity_after: 25,
      reference_type: 'order',
      reference_id: order1.id,
      created_by: admin.id,
    }),
  ]);
  console.log('📊 Seeded inventory logs');

  // ───────────────────────────────────────────── login logs
  const loginLogRepo = AppDataSource.getRepository(LoginLog);
  await loginLogRepo.save([
    loginLogRepo.create({
      user_id: customer1.id,
      ip_address: '192.168.1.10',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0)',
      logged_in_at: daysFromNow(-1),
    }),
    loginLogRepo.create({
      user_id: admin.id,
      ip_address: '10.0.0.1',
      user_agent: 'Mozilla/5.0 (Macintosh)',
      logged_in_at: new Date(),
    }),
  ]);
  console.log('🔐 Seeded login logs');

  // ───────────────────────────────────────────── refresh tokens
  const tokenRepo = AppDataSource.getRepository(RefreshToken);
  await tokenRepo.save([
    tokenRepo.create({
      user_id: customer1.id,
      token_hash: 'hashed_refresh_token_customer1',
      ip_address: '192.168.1.10',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0)',
      revoked: false,
      expires_at: daysFromNow(30),
      last_used_at: new Date(),
    }),
    tokenRepo.create({
      user_id: admin.id,
      token_hash: 'hashed_refresh_token_admin',
      revoked: true,
      revoked_at: new Date(),
      expires_at: daysFromNow(-1),
    }),
  ]);
  console.log('🔑 Seeded refresh tokens');

  // ───────────────────────────────────────────── otp codes
  const otpRepo = AppDataSource.getRepository(OtpCode);
  await otpRepo.save([
    otpRepo.create({
      phone_number: '09123333333',
      otp_hash: 'hashed_otp_123456',
      attempts: 0,
      expires_at: daysFromNow(0.01),
      verified: false,
    }),
    otpRepo.create({
      phone_number: '09121111111',
      otp_hash: 'hashed_otp_654321',
      attempts: 1,
      expires_at: daysFromNow(-0.01),
      verified: true,
    }),
  ]);
  console.log('📱 Seeded OTP codes');

  console.log('\n✅ All tables seeded successfully!');
  console.log('   Admin login phone: 09120000001');
  console.log('   Customer phone:    09121111111');

  await AppDataSource.destroy();
}

main().catch(async (error) => {
  console.error('❌ Seed failed:', error);
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
  process.exit(1);
});
