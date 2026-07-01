import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  businessName: true,
  taxId: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findByEmailWithHash(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findPublicById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: publicUserSelect,
    });
  }

  create(data: { name: string; email: string; passwordHash: string }) {
    return this.prisma.user.create({ data, select: publicUserSelect });
  }
}
