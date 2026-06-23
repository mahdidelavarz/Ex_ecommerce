// src/modules/auth/address.controller.ts
import { Request, Response } from 'express';
import { AppDataSource } from '../../config/database';
import { UserAddress } from '../../database/entities/user-address.entity';
import { asyncHandler } from '../../middleware/asyncHandler';
import { ApiResponseHelper } from '../../shared/utils/response';
import { BadRequestError, NotFoundError } from '../../shared/utils/errors';

export class AddressController {
  private addressRepo = AppDataSource.getRepository(UserAddress);

  list = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const addresses = await this.addressRepo.find({
      where: { user_id: userId },
      order: { is_default_shipping: 'DESC', created_at: 'DESC' } as any,
    });
    ApiResponseHelper.success(res, addresses);
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const {
      full_name, phone, country, state, city,
      address_line_1, address_line_2, postal_code,
      is_default_shipping, is_default_billing,
    } = req.body;

    if (!full_name || !phone || !state || !city || !address_line_1 || !postal_code) {
      throw new BadRequestError('همه فیلدهای اجباری را تکمیل کنید');
    }

    if (is_default_shipping) {
      await this.addressRepo.update(
        { user_id: userId, is_default_shipping: true },
        { is_default_shipping: false },
      );
    }
    if (is_default_billing) {
      await this.addressRepo.update(
        { user_id: userId, is_default_billing: true },
        { is_default_billing: false },
      );
    }

    const address = this.addressRepo.create({
      user_id: userId,
      full_name,
      phone,
      country: country || 'IR',
      state,
      city,
      address_line_1,
      address_line_2: address_line_2 || null,
      postal_code,
      is_default_shipping: is_default_shipping ?? false,
      is_default_billing: is_default_billing ?? false,
    });

    const saved = await this.addressRepo.save(address);
    ApiResponseHelper.created(res, saved, 'آدرس با موفقیت اضافه شد');
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const { id } = req.params;
    const address = await this.addressRepo.findOne({ where: { id, user_id: userId } });
    if (!address) throw new NotFoundError('آدرس یافت نشد');
    await this.addressRepo.remove(address);
    ApiResponseHelper.success(res, null, 'آدرس حذف شد');
  });
}
