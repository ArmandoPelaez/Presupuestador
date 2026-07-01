/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { NotFoundException } from '@nestjs/common';
import { CustomersService } from './customers.service';
import type { PrismaService } from '../../prisma/prisma.service';

describe('CustomersService', () => {
  const customer = {
    findMany: jest.fn(),
    count: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };
  const prisma = {
    customer,
    $transaction: jest.fn(async (operations: Array<Promise<unknown>>) =>
      Promise.all(operations),
    ),
  };
  const service = new CustomersService(prisma as unknown as PrismaService);
  beforeEach(() => jest.clearAllMocks());

  it('busca y pagina siempre por propietario', async () => {
    customer.findMany.mockResolvedValue([]);
    customer.count.mockResolvedValue(0);
    const result = await service.list('owner-a', {
      page: 1,
      pageSize: 20,
      search: 'Acme',
    });
    expect(customer.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userId: 'owner-a',
          OR: expect.any(Array),
        }),
      }),
    );
    expect(result.meta.total).toBe(0);
  });

  it('oculta recursos de otro usuario', async () => {
    customer.findFirst.mockResolvedValue(null);
    await expect(service.get('owner-b', 'customer-a')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(customer.findFirst).toHaveBeenCalledWith({
      where: { id: 'customer-a', userId: 'owner-b' },
    });
  });

  it('desactiva sin borrar físicamente', async () => {
    customer.findFirst.mockResolvedValue({ id: 'c1', userId: 'u1' });
    customer.update.mockResolvedValue({ id: 'c1', isActive: false });
    await expect(service.deactivate('u1', 'c1')).resolves.toMatchObject({
      isActive: false,
    });
    expect(customer.update).toHaveBeenCalledWith({
      where: { id: 'c1' },
      data: { isActive: false },
    });
  });
});
