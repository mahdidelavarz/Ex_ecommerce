// src/modules/dashboard/dashboard.service.ts
import { AppDataSource } from '../../config/database';
import { Order, PaymentStatus, OrderStatus } from '../../database/entities/order.entity';
import { Product } from '../../database/entities/product.entity';
import { User, UserRole } from '../../database/entities/user.entity';
import { ProductVariant } from '../../database/entities/product-variant.entity';

export class DashboardService {
  private orderRepo = AppDataSource.getRepository(Order);
  private productRepo = AppDataSource.getRepository(Product);
  private userRepo = AppDataSource.getRepository(User);
  private variantRepo = AppDataSource.getRepository(ProductVariant);

  async getStats() {
    const [
      revenueRow,
      totalOrders,
      pendingOrders,
      totalProducts,
      totalCustomers,
      lowStockCount,
      ordersByStatus,
      recentOrders,
    ] = await Promise.all([
      // Revenue from paid orders only
      this.orderRepo
        .createQueryBuilder('o')
        .select('COALESCE(SUM(o.total_amount), 0)', 'sum')
        .where('o.payment_status = :paid', { paid: PaymentStatus.PAID })
        .getRawOne<{ sum: string }>(),

      this.orderRepo.count(),
      this.orderRepo.count({ where: { order_status: OrderStatus.PENDING } }),
      this.productRepo.count({ where: { is_active: true } }),
      this.userRepo.count({ where: { role: UserRole.CUSTOMER } }),
      this.variantRepo
        .createQueryBuilder('v')
        .where('v.is_active = true')
        .andWhere('v.low_stock_threshold IS NOT NULL')
        .andWhere('v.stock_quantity <= v.low_stock_threshold')
        .getCount(),

      // Order counts grouped by status
      this.orderRepo
        .createQueryBuilder('o')
        .select('o.order_status', 'status')
        .addSelect('COUNT(*)', 'count')
        .groupBy('o.order_status')
        .getRawMany<{ status: string; count: string }>(),

      // 5 most recent orders
      this.orderRepo.find({
        order: { created_at: 'DESC' },
        take: 5,
      }),
    ]);

    const statusCounts: Record<string, number> = {};
    ordersByStatus.forEach((r) => {
      statusCounts[r.status] = parseInt(r.count, 10);
    });

    return {
      total_revenue: parseFloat(revenueRow?.sum ?? '0'),
      total_orders: totalOrders,
      pending_orders: pendingOrders,
      total_products: totalProducts,
      total_customers: totalCustomers,
      low_stock_count: lowStockCount,
      orders_by_status: statusCounts,
      recent_orders: recentOrders.map((o) => ({
        id: o.id,
        order_number: o.order_number,
        customer_name: o.shipping_address_snapshot?.full_name ?? o.customer_phone,
        total_amount: Number(o.total_amount),
        order_status: o.order_status,
        payment_status: o.payment_status,
        created_at: o.created_at,
      })),
    };
  }
}
