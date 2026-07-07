/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { PrismaService } from '../../prisma/prisma.service';
import { DashboardService } from './dashboard.service';
describe('DashboardService', () => {
  it('devuelve ceros y actividad vacía filtrando por usuario', async () => {
    const quote = {
      count: jest.fn().mockResolvedValue(0),
      aggregate: jest.fn().mockResolvedValue({ _sum: { total: null } }),
      findMany: jest.fn().mockResolvedValue([]),
    };
    const result = await new DashboardService({
      quote,
      customer: { count: jest.fn().mockResolvedValue(0) },
      catalogItem: { count: jest.fn().mockResolvedValue(0) },
    } as unknown as PrismaService).summary('u1');
    expect(result.counts).toEqual({
      DRAFT: 0,
      SENT: 0,
      APPROVED: 0,
      REJECTED: 0,
    });
    expect(result.recent).toEqual([]);
    expect(quote.count).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ userId: 'u1' }),
      }),
    );
  });
});
