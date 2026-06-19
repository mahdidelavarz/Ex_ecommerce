// src/modules/returns/return.repository.ts
import { AppDataSource } from '../../config/database';
import { Return, ReturnStatus } from '../../database/entities/return.entity';
import { ReturnItem } from '../../database/entities/return-item.entity';
import { NotFoundError } from '../../shared/utils/errors';

export class ReturnRepository {
  private repo = AppDataSource.getRepository(Return);

  async create(userId: string, dto: { order_id: string; reason: string; items: { order_item_id: string; quantity: number; reason?: string }[] }) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const year = new Date().getFullYear();
      const random = Math.floor(Math.random() * 9000) + 1000;
      const returnNumber = `RET-${year}-${Date.now()}-${random}`;

      const ret = queryRunner.manager.create(Return, {
        order_id: dto.order_id,
        user_id: userId,
        return_number: returnNumber,
        reason: dto.reason,
        status: ReturnStatus.PENDING,
        refund_amount: 0,
      });
      const saved = await queryRunner.manager.save(ret);

      for (const item of dto.items) {
        const returnItem = queryRunner.manager.create(ReturnItem, {
          return_id: saved.id,
          order_item_id: item.order_item_id,
          quantity: item.quantity,
          reason: item.reason ?? null,
        } as any);
        await queryRunner.manager.save(returnItem);
      }

      await queryRunner.commitTransaction();
      return queryRunner.manager.findOne(Return, {
        where: { id: saved.id },
        relations: ['items', 'items.order_item'],
      });
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findByUser(userId: string, page = 1, limit = 20) {
    const [items, total] = await this.repo.findAndCount({
      where: { user_id: userId },
      relations: ['items', 'order'],
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total, page, limit };
  }

  async findByUserAndId(userId: string, id: string) {
    const ret = await this.repo.findOne({
      where: { id, user_id: userId },
      relations: ['order', 'items', 'items.order_item'],
    });
    if (!ret) throw new NotFoundError('مرجوعی یافت نشد');
    return ret;
  }

  async findAllAdmin(options: { page: number; limit: number; status?: string }) {
    const qb = this.repo
      .createQueryBuilder('ret')
      .leftJoinAndSelect('ret.order', 'order')
      .leftJoinAndSelect('ret.user', 'user')
      .orderBy('ret.created_at', 'DESC');

    if (options.status) {
      qb.andWhere('ret.status = :status', { status: options.status });
    }

    qb.skip((options.page - 1) * options.limit).take(options.limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }

  async findByIdWithRelations(id: string) {
    const ret = await this.repo.findOne({
      where: { id },
      relations: ['order', 'user', 'items', 'items.order_item'],
    });
    if (!ret) throw new NotFoundError('مرجوعی یافت نشد');
    return ret;
  }

  async updateStatus(id: string, dto: { status: string; refund_amount?: number; admin_note?: string }) {
    const ret = await this.repo.findOne({ where: { id } });
    if (!ret) throw new NotFoundError('مرجوعی یافت نشد');

    (ret as any).status = dto.status;
    if (dto.refund_amount !== undefined) ret.refund_amount = dto.refund_amount;
    if (dto.admin_note) ret.admin_note = dto.admin_note;

    return this.repo.save(ret);
  }
}
