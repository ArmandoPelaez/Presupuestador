import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  create(userId: string, data: CreateCustomerDto) {
    return this.prisma.customer.create({ data: { ...data, userId } });
  }

  async list(userId: string, query: PaginationDto) {
    const search = query.search?.trim();
    const where: Prisma.CustomerWhereInput = {
      userId,
      ...(search
        ? {
            OR: [
              { name: { contains: search } },
              { businessName: { contains: search } },
              { email: { contains: search } },
              { taxId: { contains: search } },
            ],
          }
        : {}),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.customer.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.customer.count({ where }),
    ]);
    return {
      items,
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.ceil(total / query.pageSize),
      },
    };
  }

  async get(userId: string, id: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, userId },
    });
    if (!customer) throw new NotFoundException('Cliente no encontrado');
    return customer;
  }

  async update(userId: string, id: string, data: UpdateCustomerDto) {
    await this.get(userId, id);
    return this.prisma.customer.update({ where: { id }, data });
  }

  async deactivate(userId: string, id: string) {
    await this.get(userId, id);
    return this.prisma.customer.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
