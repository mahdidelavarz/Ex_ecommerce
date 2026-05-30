// src/modules/orders/order.service.ts
import { OrderRepository } from './order.repository';
import { CreateOrderDto } from './order.types';

export class OrderService {
  private repo = new OrderRepository();

  async create(userId: string, dto: CreateOrderDto) {
    return this.repo.createOrder(userId, dto);
  }

  async findByUser(userId: string, options: { page?: number; limit?: number; status?: string }) {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const { data, total } = await this.repo.findByUser(userId, { page, limit, status: options.status });
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findById(orderId: string, userId?: string) {
    return this.repo.findById(orderId, userId);
  }

  async cancelOrder(orderId: string, userId: string) {
    return this.repo.cancelOrder(orderId, userId);
  }

  async findAllAdmin(options: any) {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const { data, total } = await this.repo.findAllAdmin({ ...options, page, limit });
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async updateStatus(orderId: string, dto: any) {
    return this.repo.updateStatus(orderId, dto);
  }
}