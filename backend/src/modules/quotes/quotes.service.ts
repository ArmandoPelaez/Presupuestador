import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, QuoteStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { calculateQuote } from './quote-calculator';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { QuoteQueryDto } from './dto/quote-query.dto';

const include = {
  customer: true,
  items: { orderBy: { position: 'asc' as const } },
};

@Injectable()
export class QuotesService {
  constructor(private readonly prisma: PrismaService) {}

  private async validateReferences(userId: string, dto: CreateQuoteDto) {
    if (dto.validUntil && new Date(dto.validUntil) < new Date(dto.issueDate))
      throw new BadRequestException(
        'La vigencia no puede ser anterior a la emisión',
      );
    const customer = await this.prisma.customer.findFirst({
      where: { id: dto.customerId, userId, isActive: true },
    });
    if (!customer)
      throw new BadRequestException(
        'El cliente no existe, está inactivo o no pertenece al usuario',
      );
    const ids = dto.items
      .map((item) => item.catalogItemId)
      .filter((id): id is string => Boolean(id));
    if (ids.length) {
      const owned = await this.prisma.catalogItem.count({
        where: { id: { in: ids }, userId, isActive: true },
      });
      if (owned !== new Set(ids).size)
        throw new BadRequestException(
          'Un concepto no existe, está inactivo o no pertenece al usuario',
        );
    }
  }

  async create(userId: string, dto: CreateQuoteDto) {
    await this.validateReferences(userId, dto);
    const calculation = calculateQuote(
      dto.items,
      dto.discountType,
      dto.discountValue,
    );
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        return await this.prisma.$transaction(async (tx) => {
          const latest = await tx.quote.findFirst({
            where: { userId },
            orderBy: { number: 'desc' },
            select: { number: true },
          });
          return tx.quote.create({
            data: {
              userId,
              customerId: dto.customerId,
              number: (latest?.number ?? 0) + 1,
              issueDate: new Date(dto.issueDate),
              validUntil: dto.validUntil ? new Date(dto.validUntil) : null,
              notes: dto.notes,
              discountType: dto.discountType,
              discountValue: new Prisma.Decimal(dto.discountValue),
              subtotal: calculation.subtotal,
              discountTotal: calculation.discountTotal,
              taxTotal: calculation.taxTotal,
              total: calculation.total,
              items: { create: calculation.items },
            },
            include,
          });
        });
      } catch (error) {
        if (
          !(
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2002'
          ) ||
          attempt === 2
        )
          throw error;
      }
    }
    throw new ConflictException('No se pudo asignar un número correlativo');
  }

  async get(userId: string, id: string) {
    const quote = await this.prisma.quote.findFirst({
      where: { id, userId },
      include,
    });
    if (!quote) throw new NotFoundException('Presupuesto no encontrado');
    return quote;
  }

  async markSentIfDraft(userId: string, id: string) {
    await this.prisma.quote.updateMany({
      where: { id, userId, status: QuoteStatus.DRAFT },
      data: { status: QuoteStatus.SENT },
    });
    return this.get(userId, id);
  }

  async list(userId: string, q: QuoteQueryDto) {
    const where: Prisma.QuoteWhereInput = {
      userId,
      status: q.status,
      customerId: q.customerId,
      issueDate: {
        gte: q.dateFrom ? new Date(q.dateFrom) : undefined,
        lte: q.dateTo ? new Date(q.dateTo) : undefined,
      },
      ...(q.search
        ? {
            OR: [
              { customer: { name: { contains: q.search } } },
              { notes: { contains: q.search } },
            ],
          }
        : {}),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.quote.findMany({
        where,
        include: { customer: true },
        orderBy: { createdAt: 'desc' },
        skip: (q.page - 1) * q.pageSize,
        take: q.pageSize,
      }),
      this.prisma.quote.count({ where }),
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

  async update(userId: string, id: string, dto: UpdateQuoteDto) {
    const current = await this.get(userId, id);
    if (current.status !== QuoteStatus.DRAFT)
      throw new ConflictException(
        'Solo se pueden editar presupuestos en borrador',
      );
    await this.validateReferences(userId, dto);
    const calculation = calculateQuote(
      dto.items,
      dto.discountType,
      dto.discountValue,
    );
    return this.prisma.$transaction(async (tx) => {
      await tx.quoteItem.deleteMany({ where: { quoteId: id } });
      return tx.quote.update({
        where: { id },
        data: {
          customerId: dto.customerId,
          issueDate: new Date(dto.issueDate),
          validUntil: dto.validUntil ? new Date(dto.validUntil) : null,
          notes: dto.notes,
          discountType: dto.discountType,
          discountValue: new Prisma.Decimal(dto.discountValue),
          subtotal: calculation.subtotal,
          discountTotal: calculation.discountTotal,
          taxTotal: calculation.taxTotal,
          total: calculation.total,
          items: { create: calculation.items },
        },
        include,
      });
    });
  }

  async remove(userId: string, id: string) {
    const quote = await this.get(userId, id);
    if (quote.status !== QuoteStatus.DRAFT)
      throw new ConflictException('Solo se pueden eliminar borradores');
    await this.prisma.quote.delete({ where: { id } });
    return { deleted: true };
  }

  async updateStatus(userId: string, id: string, status: QuoteStatus) {
    const quote = await this.get(userId, id);
    const allowed =
      (quote.status === QuoteStatus.DRAFT && status === QuoteStatus.SENT) ||
      (quote.status === QuoteStatus.SENT &&
        (status === QuoteStatus.APPROVED || status === QuoteStatus.REJECTED));
    if (!allowed) throw new ConflictException('Transición de estado inválida');
    return this.prisma.quote.update({
      where: { id },
      data: { status },
      include,
    });
  }
}
