// src/modules/users/user.service.ts
import { AppDataSource } from '../../config/database';
import { User, UserRole } from '../../database/entities/user.entity';
import { Order } from '../../database/entities/order.entity';
import { NotFoundError, BadRequestError } from '../../shared/utils/errors';
import { Brackets } from 'typeorm';

interface ListOptions {
  search?: string;
  role?: UserRole;
  is_active?: boolean;
  page?: number;
  limit?: number;
}

export class UserService {
  private userRepo = AppDataSource.getRepository(User);
  private orderRepo = AppDataSource.getRepository(Order);

  async list(options: ListOptions) {
    const page = options.page || 1;
    const limit = Math.min(options.limit || 20, 100);

    const qb = this.userRepo
      .createQueryBuilder('user')
      .where('user.deleted_at IS NULL');

    if (options.search) {
      qb.andWhere(
        new Brackets((w) => {
          w.where('user.full_name ILIKE :s', { s: `%${options.search}%` })
            .orWhere('user.phone_number ILIKE :s', { s: `%${options.search}%` })
            .orWhere('user.email ILIKE :s', { s: `%${options.search}%` });
        })
      );
    }

    if (options.role) {
      qb.andWhere('user.role = :role', { role: options.role });
    }

    if (options.is_active !== undefined) {
      qb.andWhere('user.is_active = :active', { active: options.is_active });
    }

    qb.orderBy('user.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [users, total] = await qb.getManyAndCount();

    return {
      data: users.map((u) => this.format(u)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getById(id: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user || user.deleted_at) throw new NotFoundError('کاربر یافت نشد');

    const ordersCount = await this.orderRepo.count({ where: { user_id: id } });
    return { ...this.format(user), orders_count: ordersCount };
  }

  async updateRole(id: string, role: UserRole, actingUserId: string) {
    if (id === actingUserId && role !== UserRole.ADMIN) {
      throw new BadRequestError('نمی‌توانید نقش مدیریتی خود را تغییر دهید');
    }

    const user = await this.userRepo.findOne({ where: { id } });
    if (!user || user.deleted_at) throw new NotFoundError('کاربر یافت نشد');

    user.role = role;
    await this.userRepo.save(user);
    return this.format(user);
  }

  async updateStatus(id: string, is_active: boolean, actingUserId: string) {
    if (id === actingUserId && !is_active) {
      throw new BadRequestError('نمی‌توانید حساب خود را غیرفعال کنید');
    }

    const user = await this.userRepo.findOne({ where: { id } });
    if (!user || user.deleted_at) throw new NotFoundError('کاربر یافت نشد');

    user.is_active = is_active;
    await this.userRepo.save(user);
    return this.format(user);
  }

  private format(u: User) {
    return {
      id: u.id,
      full_name: u.full_name,
      email: u.email,
      phone_number: u.phone_number,
      role: u.role,
      is_active: u.is_active,
      profile_completed: u.profile_completed,
      last_login_at: u.last_login_at,
      created_at: u.created_at,
    };
  }
}
