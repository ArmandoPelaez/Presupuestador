import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CatalogQueryDto } from './dto/catalog-query.dto';
import { CreateCatalogItemDto } from './dto/create-catalog-item.dto';
import { UpdateCatalogItemDto } from './dto/update-catalog-item.dto';

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}
  create(userId: string, data: CreateCatalogItemDto) {
    return this.prisma.catalogItem.create({ data: { ...data, userId } });
  }
  async list(userId: string, q: CatalogQueryDto) {
    const where: Prisma.CatalogItemWhereInput = {
      userId,
      type: q.type,
      isActive: q.isActive,
      ...(q.search?.trim()
        ? {
            OR: [
              { name: { contains: q.search.trim() } },
              { description: { contains: q.search.trim() } },
            ],
          }
        : {}),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.catalogItem.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: (q.page - 1) * q.pageSize,
        take: q.pageSize,
      }),
      this.prisma.catalogItem.count({ where }),
    ]);
    return {
      items,
      meta: {
        page: q.page,
        pageSize: q.pageSize,
        total,
        totalPages: Math.ceil(total / q.pageSize),
      },
    };
  }
  async get(userId: string, id: string) {
    const item = await this.prisma.catalogItem.findFirst({
      where: { id, userId },
    });
    if (!item) throw new NotFoundException('Concepto no encontrado');
    return item;
  }
  async update(userId: string, id: string, data: UpdateCatalogItemDto) {
    await this.get(userId, id);
    return this.prisma.catalogItem.update({ where: { id }, data });
  }
  async deactivate(userId: string, id: string) {
    await this.get(userId, id);
    return this.prisma.catalogItem.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
