/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { NotFoundException } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CatalogItemType } from '@prisma/client';
import { CatalogService } from './catalog.service';
import { CreateCatalogItemDto } from './dto/create-catalog-item.dto';
import type { PrismaService } from '../../prisma/prisma.service';

describe('CatalogService', () => {
  const catalogItem = {
    findMany: jest.fn(),
    count: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };
  const prisma = {
    catalogItem,
    $transaction: jest.fn(async (operations: Array<Promise<unknown>>) =>
      Promise.all(operations),
    ),
  };
  const service = new CatalogService(prisma as unknown as PrismaService);
  beforeEach(() => jest.clearAllMocks());

  it('valida precio y stock no negativos', async () => {
    const invalid = plainToInstance(CreateCatalogItemDto, {
      type: CatalogItemType.PRODUCT,
      name: 'Item',
      unitPrice: '-1',
      stock: -1,
    });
    expect(await validate(invalid)).toHaveLength(2);
  });

  it('filtra tipo y activos por propietario', async () => {
    catalogItem.findMany.mockResolvedValue([]);
    catalogItem.count.mockResolvedValue(0);
    await service.list('u1', {
      page: 1,
      pageSize: 20,
      type: CatalogItemType.PRODUCT,
      isActive: true,
    });
    expect(catalogItem.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userId: 'u1',
          type: CatalogItemType.PRODUCT,
          isActive: true,
        }),
      }),
    );
  });

  it('oculta conceptos ajenos y desactiva sin borrar', async () => {
    catalogItem.findFirst.mockResolvedValueOnce(null);
    await expect(service.get('u2', 'item-u1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    catalogItem.findFirst.mockResolvedValueOnce({ id: 'i1', userId: 'u1' });
    catalogItem.update.mockResolvedValue({ id: 'i1', isActive: false });
    await service.deactivate('u1', 'i1');
    expect(catalogItem.update).toHaveBeenCalledWith({
      where: { id: 'i1' },
      data: { isActive: false },
    });
  });
});
