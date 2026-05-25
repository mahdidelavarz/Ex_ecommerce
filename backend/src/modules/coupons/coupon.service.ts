// src/modules/coupons/coupon.service.ts
import { CouponRepository } from './coupon.repository';
import { CreateCouponDto, UpdateCouponDto, ValidateCouponDto, CouponResponse } from './coupon.types';

export class CouponService {
  private repo = new CouponRepository();

  async list(options: { search?: string; is_active?: boolean; page?: number; limit?: number }) {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const { data, total } = await this.repo.findAll({ ...options, page, limit });
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getById(id: string): Promise<CouponResponse> {
    return this.repo.findById(id) as unknown as CouponResponse;
  }

  async create(dto: CreateCouponDto): Promise<CouponResponse> {
    return this.repo.create(dto) as unknown as CouponResponse;
  }

  async update(id: string, dto: UpdateCouponDto): Promise<CouponResponse> {
    return this.repo.update(id, dto) as unknown as CouponResponse;
  }

  async delete(id: string) {
    return this.repo.delete(id);
  }

  async validate(dto: ValidateCouponDto, userId: string) {
    return this.repo.validate(dto, userId);
  }
}