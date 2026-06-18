// src/modules/orders/order.repository.ts
import { AppDataSource } from '../../config/database';
import { Order } from '../../database/entities/order.entity';
import { OrderItem } from '../../database/entities/order-item.entity';
import { Cart } from '../../database/entities/cart.entity';
import { CartItem } from '../../database/entities/cart-item.entity';
import { ProductVariant } from '../../database/entities/product-variant.entity';
import { UserAddress } from '../../database/entities/user-address.entity';
import { Coupon } from '../../database/entities/coupon.entity';
import { User } from '../../database/entities/user.entity';
import { InventoryLog } from '../../database/entities/inventory-log.entity';
import { NotFoundError, BadRequestError } from '../../shared/utils/errors';
import { CreateOrderDto } from './order.types';

export class OrderRepository {
  private orderRepo = AppDataSource.getRepository(Order);
  private orderItemRepo = AppDataSource.getRepository(OrderItem);
  private cartRepo = AppDataSource.getRepository(Cart);
  private cartItemRepo = AppDataSource.getRepository(CartItem);
  private variantRepo = AppDataSource.getRepository(ProductVariant);
  private addressRepo = AppDataSource.getRepository(UserAddress);
  private couponRepo = AppDataSource.getRepository(Coupon);
  private userRepo = AppDataSource.getRepository(User);
  private inventoryLogRepo = AppDataSource.getRepository(InventoryLog);

  async createOrder(userId: string, dto: CreateOrderDto) {
    const cart = await this.cartRepo.findOne({
      where: { user_id: userId },
      relations: ['items', 'items.variant', 'items.variant.product'],
    });

    if (!cart || !cart.items?.length) {
      throw new BadRequestError('سبد خرید خالی است');
    }

    const shippingAddress = await this.addressRepo.findOne({
      where: { id: dto.shipping_address_id, user_id: userId },
    });
    if (!shippingAddress) throw new NotFoundError('آدرس ارسال یافت نشد');

    const billingAddress = dto.billing_address_id === dto.shipping_address_id
      ? shippingAddress
      : await this.addressRepo.findOne({ where: { id: dto.billing_address_id, user_id: userId } });
    if (!billingAddress) throw new NotFoundError('آدرس صورتحساب یافت نشد');

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundError('کاربر یافت نشد');

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let subtotal = 0;
      const orderItemsData: any[] = [];

      for (const cartItem of cart.items) {
        const variant = await queryRunner.manager.findOne(ProductVariant, {
          where: { id: cartItem.variant_id },
          relations: [
            'product',
            'variant_attribute_values',
            'variant_attribute_values.attribute_value',
            'variant_attribute_values.attribute_value.attribute',
          ],
        });

        if (!variant || !variant.is_active || !variant.product?.is_active) {
          throw new BadRequestError(`محصول در دسترس نیست`);
        }

        if (cartItem.quantity > variant.stock_quantity) {
          throw new BadRequestError(`موجودی کافی نیست (موجودی: ${variant.stock_quantity})`);
        }

        const qtyBefore = variant.stock_quantity;
        variant.stock_quantity -= cartItem.quantity;
        await queryRunner.manager.save(variant);

        // Inventory log - use direct insert
        await queryRunner.manager.insert(InventoryLog, {
          variant_id: variant.id,
          type: 'order_placed' as any,
          quantity_before: qtyBefore,
          quantity_change: -cartItem.quantity,
          quantity_after: variant.stock_quantity,
          reference_type: 'order',
          note: `سفارش توسط کاربر ${userId}`,
          created_by: userId,
        });

        const unitPrice = variant.price;
        const totalAmount = unitPrice * cartItem.quantity;
        subtotal += totalAmount;

        const attrTitle = variant.variant_attribute_values
          ?.map((vav) => vav.attribute_value?.value)
          .filter(Boolean)
          .join(' / ');

        orderItemsData.push({
          variant_id: variant.id,
          product_title: variant.product?.title || '',
          variant_title: attrTitle || variant.sku,
          sku: variant.sku,
          quantity: cartItem.quantity,
          unit_price: unitPrice,
          discount_amount: 0,
          tax_amount: 0,
          total_amount: totalAmount,
          product_snapshot: {
            product_id: variant.product?.id,
            variant_id: variant.id,
            title: variant.product?.title,
            sku: variant.sku,
            price: variant.price,
            attributes: variant.variant_attribute_values?.map((vav) => ({
              attribute: vav.attribute_value?.attribute?.name,
              value: vav.attribute_value?.value,
            })) ?? [],
          },
        });
      }

      // Apply coupon
      let discountAmount = 0;
      let appliedCouponId: string | null = null;

      if (dto.coupon_code) {
        const coupon = await queryRunner.manager.findOne(Coupon, {
          where: { code: dto.coupon_code.toUpperCase(), is_active: true },
        });

        if (!coupon) throw new BadRequestError('کد تخفیف نامعتبر است');

        const now = new Date();
        if (now < coupon.starts_at || now > coupon.expires_at) {
          throw new BadRequestError('کد تخفیف منقضی شده است');
        }

        if (coupon.min_order_amount && subtotal < coupon.min_order_amount) {
          throw new BadRequestError(`حداقل مبلغ سفارش برای این کد ${Number(coupon.min_order_amount).toLocaleString()} تومان است`);
        }

        if (coupon.usage_limit) {
          const usedCount = await queryRunner.manager.count(Order, {
            where: { coupon_id: coupon.id },
          });
          if (usedCount >= coupon.usage_limit) {
            throw new BadRequestError('ظرفیت استفاده از این کد تخفیف به پایان رسیده است');
          }
        }

        if (coupon.usage_per_user) {
          const userUsed = await queryRunner.manager.count(Order, {
            where: { coupon_id: coupon.id, user_id: userId },
          });
          if (userUsed >= coupon.usage_per_user) {
            throw new BadRequestError('شما قبلاً از این کد تخفیف استفاده کرده‌اید');
          }
        }

        if (coupon.type === 'percentage') {
          discountAmount = Math.round((subtotal * Number(coupon.value)) / 100);
          if (coupon.max_discount && discountAmount > coupon.max_discount) {
            discountAmount = coupon.max_discount;
          }
        } else if (coupon.type === 'fixed') {
          discountAmount = Math.min(Number(coupon.value), subtotal);
        }
        appliedCouponId = coupon.id;
      }

      const shippingAmount = 50000;
      const taxAmount = 0;
      const totalAmount = Math.max(0, subtotal - discountAmount + shippingAmount + taxAmount);

      // Generate order number
      const orderCount = await queryRunner.manager.count(Order);
      const orderNumber = `NZS-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(orderCount + 1).padStart(5, '0')}`;

      // Create order with direct insert
      const orderInsert = {
        order_number: orderNumber,
        user_id: userId,
        currency_code: 'IRR',
        subtotal,
        discount_amount: discountAmount,
        shipping_amount: shippingAmount,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        paid_amount: 0,
        due_amount: totalAmount,
        payment_status: 'pending' as any,
        fulfillment_status: 'unfulfilled' as any,
        order_status: 'pending' as any,
        coupon_id: appliedCouponId,
        shipping_address_snapshot: {
          full_name: shippingAddress.full_name,
          phone: shippingAddress.phone,
          country: shippingAddress.country,
          state: shippingAddress.state,
          city: shippingAddress.city,
          address_line_1: shippingAddress.address_line_1,
          address_line_2: shippingAddress.address_line_2,
          postal_code: shippingAddress.postal_code,
        },
        billing_address_snapshot: {
          full_name: billingAddress.full_name,
          phone: billingAddress.phone,
          country: billingAddress.country,
          state: billingAddress.state,
          city: billingAddress.city,
          address_line_1: billingAddress.address_line_1,
          address_line_2: billingAddress.address_line_2,
          postal_code: billingAddress.postal_code,
        },
        customer_email: user.email || '',
        customer_phone: user.phone_number || '',
        customer_note: dto.customer_note || null,
        placed_at: new Date(),
      };

      const insertResult = await queryRunner.manager.insert(Order, orderInsert as any);
      const savedOrderId = insertResult.identifiers[0].id;

      // Create order items
      for (const itemData of orderItemsData) {
        await queryRunner.manager.insert(OrderItem, {
          ...itemData,
          order_id: savedOrderId,
        } as any);
      }

      // Clear cart
      await queryRunner.manager.delete(CartItem, { cart_id: cart.id });

      await queryRunner.commitTransaction();

      return this.findById(savedOrderId, userId);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findByUser(userId: string, options: { page: number; limit: number; status?: string }) {
    const qb = this.orderRepo
      .createQueryBuilder('order')
      .leftJoin('order.items', 'items')
      .addSelect('COUNT(items.id)', 'items_count')
      .where('order.user_id = :userId', { userId })
      .groupBy('order.id')
      .orderBy('order.created_at', 'DESC');

    if (options.status) {
      qb.andWhere('order.order_status = :status', { status: options.status });
    }

    qb.skip((options.page - 1) * options.limit).take(options.limit);
    const [data, total] = await qb.getManyAndCount();

    return {
      data: data.map((o: any) => ({
        id: o.id,
        order_number: o.order_number,
        total_amount: o.total_amount,
        payment_status: o.payment_status,
        fulfillment_status: o.fulfillment_status,
        order_status: o.order_status,
        items_count: parseInt(o.items_count) || 0,
        created_at: o.created_at,
      })),
      total,
    };
  }

  async findAllAdmin(options: any) {
    const qb = this.orderRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.user', 'user')
      .orderBy('order.created_at', 'DESC');

    if (options.search) {
      qb.andWhere('(order.order_number ILIKE :search OR user.full_name ILIKE :search OR user.phone_number ILIKE :search)', {
        search: `%${options.search}%`,
      });
    }
    if (options.status) qb.andWhere('order.order_status = :status', { status: options.status });
    if (options.payment_status) qb.andWhere('order.payment_status = :paymentStatus', { paymentStatus: options.payment_status });
    if (options.date_from) qb.andWhere('order.created_at >= :dateFrom', { dateFrom: options.date_from });
    if (options.date_to) qb.andWhere('order.created_at <= :dateTo', { dateTo: options.date_to });

    qb.skip((options.page - 1) * options.limit).take(options.limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }

  async findById(orderId: string, userId?: string) {
    const qb = this.orderRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .where('order.id = :orderId', { orderId });

    if (userId) {
      qb.andWhere('order.user_id = :userId', { userId });
    }

    const order = await qb.getOne();
    if (!order) throw new NotFoundError('سفارش یافت نشد');
    return order;
  }

  async cancelOrder(orderId: string, userId: string) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId, user_id: userId },
      relations: ['items'],
    });

    if (!order) throw new NotFoundError('سفارش یافت نشد');
    if (!['pending', 'confirmed'].includes(order.order_status)) {
      throw new BadRequestError('این سفارش قابل لغو نیست');
    }

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const item of order.items) {
        if (item.variant_id) {
          const variant = await queryRunner.manager.findOne(ProductVariant, {
            where: { id: item.variant_id },
          });
          if (variant) {
            const qtyBefore = variant.stock_quantity;
            variant.stock_quantity += item.quantity;
            await queryRunner.manager.save(variant);

            await queryRunner.manager.insert(InventoryLog, {
              variant_id: variant.id,
              type: 'order_cancelled' as any,
              quantity_before: qtyBefore,
              quantity_change: item.quantity,
              quantity_after: variant.stock_quantity,
              reference_type: 'order',
              reference_id: orderId,
              note: 'لغو سفارش',
            });
          }
        }
      }

      // Use update instead of save
      await queryRunner.manager.update(Order, orderId, {
        order_status: 'cancelled' as any,
      });

      await queryRunner.commitTransaction();
      return this.findById(orderId, userId);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateStatus(orderId: string, dto: any) {
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) throw new NotFoundError('سفارش یافت نشد');

    const updateData: any = {};
    if (dto.order_status) updateData.order_status = dto.order_status;
    if (dto.payment_status) updateData.payment_status = dto.payment_status;
    if (dto.fulfillment_status) updateData.fulfillment_status = dto.fulfillment_status;
    if (dto.admin_note) updateData.admin_note = dto.admin_note;

    await this.orderRepo.update(orderId, updateData);
    return this.findById(orderId);
  }
}