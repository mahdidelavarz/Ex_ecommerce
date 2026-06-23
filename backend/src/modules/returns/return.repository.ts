// src/modules/returns/return.repository.ts
import { AppDataSource } from '../../config/database';
import { Return, ReturnStatus } from '../../database/entities/return.entity';
import { ReturnItem } from '../../database/entities/return-item.entity';
import { ProductVariant } from '../../database/entities/product-variant.entity';
import { InventoryLogType } from '../../database/entities/inventory-log.entity';
import { writeInventoryLog } from '../../shared/utils/inventory-log';
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

  async updateStatus(
    id: string,
    dto: { status: string; refund_amount?: number; admin_note?: string },
    userId?: string,
  ) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const ret = await queryRunner.manager.findOne(Return, {
        where: { id },
        relations: ['items', 'items.order_item'],
      });
      if (!ret) throw new NotFoundError('مرجوعی یافت نشد');

      const wasReceived = ret.status === ReturnStatus.RECEIVED;

      ret.status = dto.status as ReturnStatus;
      if (dto.refund_amount !== undefined) ret.refund_amount = dto.refund_amount;
      if (dto.admin_note) ret.admin_note = dto.admin_note;
      await queryRunner.manager.save(ret);

      // Restock returned items the first time the return is marked "received"
      if (dto.status === ReturnStatus.RECEIVED && !wasReceived) {
        for (const item of ret.items) {
          const variantId = item.order_item?.variant_id;
          if (!variantId) continue; // variant was deleted — nothing to restock

          const variant = await queryRunner.manager.findOne(ProductVariant, {
            where: { id: variantId },
          });
          if (!variant) continue;

          const before = variant.stock_quantity;
          variant.stock_quantity += item.quantity;
          await queryRunner.manager.save(variant);

          await writeInventoryLog(queryRunner.manager, {
            variantId,
            type: InventoryLogType.RETURN_RECEIVED,
            quantityBefore: before,
            quantityChange: item.quantity,
            quantityAfter: variant.stock_quantity,
            referenceType: 'return',
            referenceId: ret.id,
            note: `مرجوعی ${ret.return_number}`,
            createdBy: userId ?? null,
          });
        }
      }

      await queryRunner.commitTransaction();
      return ret;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
