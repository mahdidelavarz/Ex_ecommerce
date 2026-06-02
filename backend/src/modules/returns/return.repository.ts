// src/modules/returns/return.repository.ts
import { AppDataSource } from '../../config/database';
import { Return } from '../../database/entities/return.entity';
import { ReturnItem } from '../../database/entities/return-item.entity';
import { Order } from '../../database/entities/order.entity';
import { OrderItem } from '../../database/entities/order-item.entity';
import { NotFoundError, BadRequestError } from '../../shared/utils/errors';

export class ReturnRepository {
    private repo = AppDataSource.getRepository(Return);
    private returnItemRepo = AppDataSource.getRepository(ReturnItem);
    private orderRepo = AppDataSource.getRepository(Order);

    async create(userId: string, dto: { order_id: string; reason: string; items: { order_item_id: string; quantity: number; reason?: string }[] }) {
        const order = await this.orderRepo.findOne({ where: { id: dto.order_id, user_id: userId } });
        if (!order) throw new NotFoundError('سفارش یافت نشد');

        const returnCount = await this.repo.count();
        const returnNumber = `RET-${new Date().getFullYear()}-${String(returnCount + 1).padStart(4, '0')}`;

        const ret = this.repo.create({
            order_id: dto.order_id,
            user_id: userId,
            return_number: returnNumber,
            reason: dto.reason,
            status: 'pending' as any,
            refund_amount: 0,
        });

        const saved = await this.repo.save(ret);

        for (const item of dto.items) {
            await this.returnItemRepo.save({
                return_id: saved.id,
                order_item_id: item.order_item_id,
                quantity: item.quantity,
                reason: item.reason || null,
            } as any);
        }

        return this.repo.findOne({ where: { id: saved.id }, relations: ['items', 'items.order_item'] });
    }

    async findByUser(userId: string) {
        return this.repo.find({ where: { user_id: userId }, relations: ['items', 'order'], order: { created_at: 'DESC' } });
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

        if (dto.status) (ret as any).status = dto.status;
        if (dto.refund_amount !== undefined) ret.refund_amount = dto.refund_amount;
        if (dto.admin_note) ret.admin_note = dto.admin_note;

        return this.repo.save(ret);
    }
}