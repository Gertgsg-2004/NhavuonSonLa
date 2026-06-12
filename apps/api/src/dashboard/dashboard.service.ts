import { Injectable } from '@nestjs/common';
import { OrderStatus, QuoteStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  /** Các thẻ số liệu trên dashboard admin */
  async summary() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [revenueThisMonth, newOrders, ordersToday, newCustomersThisMonth, pendingQuotes, lowStock, totalDebt] =
      await Promise.all([
        this.prisma.order.aggregate({
          _sum: { totalAmount: true },
          where: { status: OrderStatus.COMPLETED, updatedAt: { gte: startOfMonth } },
        }),
        this.prisma.order.count({ where: { status: OrderStatus.NEW } }),
        this.prisma.order.count({ where: { createdAt: { gte: startOfToday } } }),
        this.prisma.customer.count({ where: { createdAt: { gte: startOfMonth } } }),
        this.prisma.quote.count({ where: { status: QuoteStatus.PENDING } }),
        // Sản phẩm sắp hết: tồn ≤ ngưỡng cảnh báo (so sánh 2 cột → raw SQL)
        this.prisma.$queryRaw<{ count: number }[]>`
          SELECT COUNT(*)::int AS count FROM products
          WHERE status = 'ACTIVE' AND "stockQuantity" <= "lowStockThreshold"`,
        this.prisma.customer.aggregate({ _sum: { currentDebt: true } }),
      ]);

    return {
      revenueThisMonth: Number(revenueThisMonth._sum.totalAmount ?? 0),
      newOrders,
      ordersToday,
      newCustomersThisMonth,
      pendingQuotes,
      lowStockProducts: lowStock[0]?.count ?? 0,
      totalCustomerDebt: Number(totalDebt._sum.currentDebt ?? 0),
    };
  }

  /** Doanh thu 12 tháng (đơn COMPLETED) cho biểu đồ */
  async revenueByMonth(year: number) {
    const rows = await this.prisma.$queryRaw<{ month: number; revenue: number }[]>`
      SELECT EXTRACT(MONTH FROM "updatedAt")::int AS month,
             COALESCE(SUM("totalAmount"), 0)::float AS revenue
      FROM orders
      WHERE status = 'COMPLETED'
        AND EXTRACT(YEAR FROM "updatedAt") = ${year}
      GROUP BY 1 ORDER BY 1`;

    const byMonth = new Map(rows.map((r) => [r.month, r.revenue]));
    return Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      revenue: byMonth.get(i + 1) ?? 0,
    }));
  }

  async topProducts(limit = 5) {
    const groups = await this.prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { subtotal: true, quantity: true },
      where: { order: { status: OrderStatus.COMPLETED } },
      orderBy: { _sum: { subtotal: 'desc' } },
      take: limit,
    });
    const products = await this.prisma.product.findMany({
      where: { id: { in: groups.map((g) => g.productId) } },
      select: { id: true, name: true, slug: true },
    });
    const nameOf = new Map(products.map((p) => [p.id, p]));
    return groups.map((g) => ({
      product: nameOf.get(g.productId),
      revenue: Number(g._sum.subtotal ?? 0),
      quantitySold: Number(g._sum.quantity ?? 0),
    }));
  }

  async topCustomers(limit = 5) {
    const groups = await this.prisma.order.groupBy({
      by: ['customerId'],
      _sum: { totalAmount: true },
      _count: true,
      where: { status: OrderStatus.COMPLETED },
      orderBy: { _sum: { totalAmount: 'desc' } },
      take: limit,
    });
    const customers = await this.prisma.customer.findMany({
      where: { id: { in: groups.map((g) => g.customerId) } },
      select: { id: true, code: true, companyName: true, province: true },
    });
    const byId = new Map(customers.map((c) => [c.id, c]));
    return groups.map((g) => ({
      customer: byId.get(g.customerId),
      revenue: Number(g._sum.totalAmount ?? 0),
      orderCount: g._count,
    }));
  }
}
