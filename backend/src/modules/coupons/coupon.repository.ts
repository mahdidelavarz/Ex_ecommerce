// src/modules/coupons/coupon.repository.ts
import { AppDataSource } from "../../config/database";
import { Coupon } from "../../database/entities/coupon.entity";
import { CouponProduct } from "../../database/entities/coupon-product.entity";
import { CouponCategory } from "../../database/entities/coupon-category.entity";
import { Order } from "../../database/entities/order.entity";
import { Product } from "../../database/entities/product.entity";
import {
  NotFoundError,
  ConflictError,
  BadRequestError,
} from "../../shared/utils/errors";
import {
  CreateCouponDto,
  UpdateCouponDto,
  ValidateCouponDto,
  ValidateCouponResponse,
} from "./coupon.types";
import { In, MoreThanOrEqual } from "typeorm";

export class CouponRepository {
  private repo = AppDataSource.getRepository(Coupon);
  private couponProductRepo = AppDataSource.getRepository(CouponProduct);
  private couponCategoryRepo = AppDataSource.getRepository(CouponCategory);
  private orderRepo = AppDataSource.getRepository(Order);
  private productRepo = AppDataSource.getRepository(Product);

  async findAll(options: {
    search?: string;
    is_active?: boolean;
    page: number;
    limit: number;
  }) {
    const qb = this.repo
      .createQueryBuilder("coupon")
      .leftJoin("coupon.orders", "orders")
      .addSelect("COUNT(orders.id)", "used_count")
      .groupBy("coupon.id")
      .orderBy("coupon.created_at", "DESC");

    if (options.search) {
      qb.andWhere("coupon.code ILIKE :search", {
        search: `%${options.search}%`,
      });
    }
    if (options.is_active !== undefined) {
      qb.andWhere("coupon.is_active = :is_active", {
        is_active: options.is_active,
      });
    }

    qb.skip((options.page - 1) * options.limit).take(options.limit);
    const [data, total] = await qb.getManyAndCount();

    return {
      data: data.map((c: any) => ({
        ...c,
        used_count: parseInt(c.used_count) || 0,
      })),
      total,
    };
  }

  async findById(id: string) {
    const coupon = await this.repo.findOne({
      where: { id },
      relations: [
        "coupon_products",
        "coupon_products.product",
        "coupon_categories",
        "coupon_categories.category",
      ],
    });
    if (!coupon) throw new NotFoundError("کد تخفیف یافت نشد");
    return coupon;
  }


  async create(dto: CreateCouponDto) {
    const existing = await this.repo.findOne({ where: { code: dto.code } });
    if (existing) throw new ConflictError("این کد تخفیف قبلاً ثبت شده است");

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {

      const coupon = new Coupon();
      coupon.code = dto.code;
      coupon.type = dto.type as any;
      coupon.value = dto.value;
      coupon.min_order_amount = dto.min_order_amount || null;
      coupon.max_discount = dto.max_discount || null;
      coupon.usage_limit = dto.usage_limit || null;
      coupon.usage_per_user = dto.usage_per_user || null;
      coupon.starts_at = new Date(dto.starts_at);
      coupon.expires_at = new Date(dto.expires_at);
      coupon.is_active = dto.is_active ?? true;

      const saved = await queryRunner.manager.save(coupon);

      if (dto.product_ids?.length) {
        const products = dto.product_ids.map((pid) => ({
          coupon_id: saved.id,
          product_id: pid,
        }));
        await queryRunner.manager.insert(CouponProduct, products);
      }

      if (dto.category_ids?.length) {
        const categories = dto.category_ids.map((cid) => ({
          coupon_id: saved.id,
          category_id: cid,
        }));
        await queryRunner.manager.insert(CouponCategory, categories);
      }

      await queryRunner.commitTransaction();
      return this.findById(saved.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async update(id: string, dto: UpdateCouponDto) {
    const coupon = await this.repo.findOne({ where: { id } });
    if (!coupon) throw new NotFoundError("کد تخفیف یافت نشد");

    if (dto.code && dto.code !== coupon.code) {
      const existing = await this.repo.findOne({ where: { code: dto.code } });
      if (existing) throw new ConflictError("این کد تخفیف قبلاً ثبت شده است");
    }

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { product_ids, category_ids, ...couponData } = dto;

      if (dto.starts_at)
        (couponData as any).starts_at = new Date(dto.starts_at);
      if (dto.expires_at)
        (couponData as any).expires_at = new Date(dto.expires_at);

      Object.assign(coupon, couponData);
      await queryRunner.manager.save(coupon);

      if (product_ids !== undefined) {
        await queryRunner.manager.delete(CouponProduct, { coupon_id: id });
        if (product_ids.length > 0) {
          await queryRunner.manager.save(
            product_ids.map((pid) =>
              this.couponProductRepo.create({ coupon_id: id, product_id: pid }),
            ),
          );
        }
      }

      if (category_ids !== undefined) {
        await queryRunner.manager.delete(CouponCategory, { coupon_id: id });
        if (category_ids.length > 0) {
          await queryRunner.manager.save(
            category_ids.map((cid) =>
              this.couponCategoryRepo.create({
                coupon_id: id,
                category_id: cid,
              }),
            ),
          );
        }
      }

      await queryRunner.commitTransaction();
      return this.findById(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async delete(id: string) {
    const coupon = await this.repo.findOne({ where: { id } });
    if (!coupon) throw new NotFoundError("کد تخفیف یافت نشد");

    await this.couponProductRepo.delete({ coupon_id: id });
    await this.couponCategoryRepo.delete({ coupon_id: id });
    await this.repo.remove(coupon);
  }

  async validate(
    dto: ValidateCouponDto,
    userId: string,
  ): Promise<ValidateCouponResponse> {
    const coupon = await this.repo.findOne({
      where: { code: dto.code },
      relations: ["coupon_products", "coupon_categories"],
    });

    if (!coupon) {
      return { valid: false, discount_amount: 0, final_amount: dto.cart_total };
    }

    // Check active
    if (!coupon.is_active) {
      throw new BadRequestError("این کد تخفیف غیرفعال است");
    }

    // Check dates
    const now = new Date();
    if (now < coupon.starts_at)
      throw new BadRequestError("این کد تخفیف هنوز فعال نشده است");
    if (now > coupon.expires_at)
      throw new BadRequestError("این کد تخفیف منقضی شده است");

    // Check usage limit
    if (coupon.usage_limit) {
      const usedCount = await this.orderRepo.count({
        where: { coupon_id: coupon.id },
      });
      if (usedCount >= coupon.usage_limit) {
        throw new BadRequestError(
          "ظرفیت استفاده از این کد تخفیف به پایان رسیده است",
        );
      }
    }

    // Check per-user limit
    if (coupon.usage_per_user) {
      const userUsed = await this.orderRepo.count({
        where: { coupon_id: coupon.id, user_id: userId },
      });
      if (userUsed >= coupon.usage_per_user) {
        throw new BadRequestError("شما قبلاً از این کد تخفیف استفاده کرده‌اید");
      }
    }

    // Check minimum order
    if (coupon.min_order_amount && dto.cart_total < coupon.min_order_amount) {
      throw new BadRequestError(
        `حداقل مبلغ سفارش برای این کد تخفیف ${coupon.min_order_amount.toLocaleString()} تومان است`,
      );
    }

    // Check product restrictions
    if (coupon.coupon_products?.length > 0) {
      const validProductIds = coupon.coupon_products.map((cp) => cp.product_id);
      const hasValidProduct = dto.product_ids.some((pid) =>
        validProductIds.includes(pid),
      );
      if (!hasValidProduct) {
        throw new BadRequestError(
          "این کد تخفیف برای محصولات سبد خرید شما معتبر نیست",
        );
      }
    }

    // Check category restrictions
    if (coupon.coupon_categories?.length > 0) {
      const allowedCategoryIds = coupon.coupon_categories.map((cc) => cc.category_id);
      const products = dto.product_ids.length
        ? await this.productRepo.findBy({ id: In(dto.product_ids) })
        : [];
      const itemCategoryIds = products.map((p) => p.category_id);
      const hasMatch = itemCategoryIds.some((id) => allowedCategoryIds.includes(id));
      if (!hasMatch) {
        throw new BadRequestError(
          "این کد تخفیف برای دسته‌بندی‌های انتخاب‌شده معتبر نیست",
        );
      }
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.type === "percentage") {
      discountAmount = Math.round((dto.cart_total * coupon.value) / 100);
      if (coupon.max_discount && discountAmount > coupon.max_discount) {
        discountAmount = coupon.max_discount;
      }
    } else if (coupon.type === "fixed") {
      discountAmount = Math.min(coupon.value, dto.cart_total);
    }
    // free_shipping: discount = 0, applied at shipping calculation

    return {
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
      },
      discount_amount: discountAmount,
      final_amount: Math.max(0, dto.cart_total - discountAmount),
    };
  }
}
