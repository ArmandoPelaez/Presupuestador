import { Injectable } from '@nestjs/common';
import { QuoteStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}
  async summary(userId: string) {
    const statuses = Object.values(QuoteStatus);
    const rows = await Promise.all(
      statuses.map(async (status) => {
        const [count, amount] = await Promise.all([
          this.prisma.quote.count({ where: { userId, status } }),
          this.prisma.quote.aggregate({
            where: { userId, status },
            _sum: { total: true },
          }),
        ]);
        return { status, count, total: amount._sum.total ?? '0' };
      }),
    );
    const [recent, customers, catalogItems] = await Promise.all([
      this.prisma.quote.findMany({
        where: { userId },
        include: { customer: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      this.prisma.customer.count({ where: { userId, isActive: true } }),
      this.prisma.catalogItem.count({ where: { userId, isActive: true } }),
    ]);
    return {
      counts: Object.fromEntries(rows.map((r) => [r.status, r.count])),
      totals: Object.fromEntries(rows.map((r) => [r.status, r.total])),
      totalQuotes: rows.reduce((sum, row) => sum + row.count, 0),
      customers,
      catalogItems,
      recent,
    };
  }
}
