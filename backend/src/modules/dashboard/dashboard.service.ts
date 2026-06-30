// src/modules/dashboard/dashboard.service.ts
import { AppDataSource } from '../../config/database';
import { Order, PaymentStatus, OrderStatus } from '../../database/entities/order.entity';
import { Product } from '../../database/entities/product.entity';
import { User, UserRole } from '../../database/entities/user.entity';
import { ProductVariant } from '../../database/entities/product-variant.entity';

export type DashboardPeriod = '7d' | '30d' | 'month' | 'all';

export class DashboardService {
  private orderRepo = AppDataSource.getRepository(Order);
  private productRepo = AppDataSource.getRepository(Product);
  private userRepo = AppDataSource.getRepository(User);
  private variantRepo = AppDataSource.getRepository(ProductVariant);

  /**
   * Resolve a period token to the earliest `created_at` that should be counted.
   * `all` returns null (no lower bound).
   */
  private resolveSince(period: DashboardPeriod): Date | null {
    const now = new Date();
    switch (period) {
      case '7d': {
        const d = new Date(now);
        d.setDate(d.getDate() - 7);
        return d;
      }
      case '30d': {
        const d = new Date(now);
        d.setDate(d.getDate() - 30);
        return d;
      }
      case 'month':
        return new Date(now.getFullYear(), now.getMonth(), 1);
      case 'all':
      default:
        return null;
    }
  }

  async getStats(period: DashboardPeriod = '30d') {
    const since = this.resolveSince(period);

    const [
      revenueRow,
      financialRow,
      discountRow,
      paidOrdersCount,
      totalOrders,
      pendingOrders,
      totalProducts,
      totalCustomers,
      lowStockCount,
      ordersByStatus,
      recentOrders,
    ] = await Promise.all([
      // All-time revenue from paid orders (period-independent headline KPI)
      this.orderRepo
        .createQueryBuilder('o')
        .select('COALESCE(SUM(o.total_amount), 0)', 'sum')
        .where('o.payment_status = :paid', { paid: PaymentStatus.PAID })
        .getRawOne<{ sum: string }>(),

      // Sell (GMV), COGS and items sold over paid orders in the selected period.
      // LEFT JOIN variant: deleted variants (SET NULL) contribute 0 cost.
      (() => {
        const qb = this.orderRepo
          .createQueryBuilder('o')
          .innerJoin('o.items', 'oi')
          .leftJoin('oi.variant', 'v')
          .select('COALESCE(SUM(oi.total_amount), 0)', 'sell')
          .addSelect('COALESCE(SUM(oi.quantity * COALESCE(v.cost, 0)), 0)', 'cogs')
          .addSelect('COALESCE(SUM(oi.quantity), 0)', 'items')
          .where('o.payment_status = :paid', { paid: PaymentStatus.PAID });
        if (since) qb.andWhere('o.created_at >= :since', { since });
        return qb.getRawOne<{ sell: string; cogs: string; items: string }>();
      })(),

      // Coupon-level discount over paid orders in period
      (() => {
        const qb = this.orderRepo
          .createQueryBuilder('o')
          .select('COALESCE(SUM(o.discount_amount), 0)', 'sum')
          .where('o.payment_status = :paid', { paid: PaymentStatus.PAID });
        if (since) qb.andWhere('o.created_at >= :since', { since });
        return qb.getRawOne<{ sum: string }>();
      })(),

      // Paid order count in period (for average order value)
      (() => {
        const qb = this.orderRepo
          .createQueryBuilder('o')
          .where('o.payment_status = :paid', { paid: PaymentStatus.PAID });
        if (since) qb.andWhere('o.created_at >= :since', { since });
        return qb.getCount();
      })(),

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

    const totalSell = parseFloat(financialRow?.sell ?? '0');
    const totalCogs = parseFloat(financialRow?.cogs ?? '0');
    const totalItemsSold = parseInt(financialRow?.items ?? '0', 10);
    const totalDiscount = parseFloat(discountRow?.sum ?? '0');
    const totalProfit = totalSell - totalCogs - totalDiscount;
    const avgOrderValue = paidOrdersCount > 0 ? totalSell / paidOrdersCount : 0;

    return {
      total_revenue: parseFloat(revenueRow?.sum ?? '0'),
      total_sell: totalSell,
      total_cogs: totalCogs,
      total_discount: totalDiscount,
      total_items_sold: totalItemsSold,
      total_profit: totalProfit,
      avg_order_value: avgOrderValue,
      paid_orders_count: paidOrdersCount,
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

  /**
   * Daily sell / cost / profit / item / order series over paid orders in the
   * selected period — drives the sales-over-time chart.
   */
  async getSalesSeries(period: DashboardPeriod = '30d') {
    const since = this.resolveSince(period);

    const qb = this.orderRepo
      .createQueryBuilder('o')
      .innerJoin('o.items', 'oi')
      .leftJoin('oi.variant', 'v')
      .select("date_trunc('day', o.created_at)", 'day')
      .addSelect('COALESCE(SUM(oi.total_amount), 0)', 'sell')
      .addSelect('COALESCE(SUM(oi.quantity * COALESCE(v.cost, 0)), 0)', 'cogs')
      .addSelect('COALESCE(SUM(oi.quantity), 0)', 'items')
      .addSelect('COUNT(DISTINCT o.id)', 'orders')
      .where('o.payment_status = :paid', { paid: PaymentStatus.PAID });
    if (since) qb.andWhere('o.created_at >= :since', { since });
    qb.groupBy('day').orderBy('day', 'ASC');

    const rows = await qb.getRawMany<{
      day: string;
      sell: string;
      cogs: string;
      items: string;
      orders: string;
    }>();

    return rows.map((r) => {
      const sell = parseFloat(r.sell);
      const cogs = parseFloat(r.cogs);
      return {
        date: r.day,
        sell,
        cogs,
        profit: sell - cogs,
        items: parseInt(r.items, 10),
        orders: parseInt(r.orders, 10),
      };
    });
  }

  /**
   * Best-selling products (by quantity) over paid orders in the period.
   * Grouped on the order-item title + snapshot product_id so it survives
   * variant deletion.
   */
  async getTopProducts(period: DashboardPeriod = '30d', limit = 8) {
    const since = this.resolveSince(period);

    const qb = this.orderRepo
      .createQueryBuilder('o')
      .innerJoin('o.items', 'oi')
      .select("oi.product_snapshot ->> 'product_id'", 'product_id')
      .addSelect('oi.product_title', 'product_title')
      .addSelect('COALESCE(SUM(oi.quantity), 0)', 'quantity_sold')
      .addSelect('COALESCE(SUM(oi.total_amount), 0)', 'revenue')
      .where('o.payment_status = :paid', { paid: PaymentStatus.PAID });
    if (since) qb.andWhere('o.created_at >= :since', { since });
    qb.groupBy('product_id')
      .addGroupBy('oi.product_title')
      .orderBy('quantity_sold', 'DESC')
      .limit(limit);

    const rows = await qb.getRawMany<{
      product_id: string | null;
      product_title: string;
      quantity_sold: string;
      revenue: string;
    }>();

    return rows.map((r) => ({
      product_id: r.product_id,
      product_title: r.product_title,
      quantity_sold: parseInt(r.quantity_sold, 10),
      revenue: parseFloat(r.revenue),
    }));
  }

  /**
   * Active variants at or below their low-stock threshold, with product +
   * attribute context so the admin can act (restock the right color/size).
   * Same predicate as the `low_stock_count` KPI above.
   */
  async getLowStockVariants() {
    const variants = await this.variantRepo
      .createQueryBuilder('v')
      .leftJoinAndSelect('v.product', 'product')
      .leftJoinAndSelect('v.variant_attribute_values', 'vav')
      .leftJoinAndSelect('vav.attribute_value', 'av')
      .leftJoinAndSelect('av.attribute', 'attr')
      .where('v.is_active = true')
      .andWhere('v.low_stock_threshold IS NOT NULL')
      .andWhere('v.stock_quantity <= v.low_stock_threshold')
      // Product.deleted_at is a plain column (not a soft-delete column), so filter it manually
      .andWhere('product.deleted_at IS NULL')
      .orderBy('v.stock_quantity', 'ASC')
      .getMany();

    return variants.map((v) => ({
      variant_id: v.id,
      sku: v.sku,
      stock_quantity: v.stock_quantity,
      low_stock_threshold: v.low_stock_threshold,
      product_id: v.product_id,
      product_title: v.product?.title ?? '',
      attributes: (v.variant_attribute_values ?? []).map((vav) => ({
        name: vav.attribute_value?.attribute?.name ?? '',
        value: vav.attribute_value?.value ?? '',
        color_code: vav.attribute_value?.color_code ?? null,
      })),
    }));
  }
}
