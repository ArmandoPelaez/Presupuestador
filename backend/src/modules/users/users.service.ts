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

  async findOrCreateGoogleUser(data: {
    googleSubject: string;
    email: string;
    name: string;
  }) {
    const bySubject = await this.prisma.user.findUnique({
      where: { googleSubject: data.googleSubject },
      select: publicUserSelect,
    });
    if (bySubject) return bySubject;

    const byEmail = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (byEmail) {
      return this.prisma.user.update({
        where: { id: byEmail.id },
        data: { googleSubject: data.googleSubject },
        select: publicUserSelect,
      });
    }

    return this.prisma.user.create({
      data: {
        googleSubject: data.googleSubject,
        email: data.email,
        name: data.name,
      },
      select: publicUserSelect,
    });
  }
}
