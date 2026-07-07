import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, QuoteDecision, QuoteStatus } from '@prisma/client';
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from 'node:crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { generateShareToken, hashShareToken } from './quote-share-token';

const publicQuoteSelect = {
  number: true,
  status: true,
  issueDate: true,
  validUntil: true,
  currency: true,
  notes: true,
  subtotal: true,
  discountTotal: true,
  taxTotal: true,
  total: true,
  user: { select: { name: true, businessName: true, taxId: true } },
  customer: {
    select: {
      name: true,
      businessName: true,
      taxId: true,
      address: true,
    },
  },
  items: {
    orderBy: { position: 'asc' as const },
    select: {
      description: true,
      quantity: true,
      unit: true,
      unitPrice: true,
      taxRate: true,
      lineSubtotal: true,
      lineTax: true,
      lineTotal: true,
      position: true,
    },
  },
} satisfies Prisma.QuoteSelect;

@Injectable()
export class QuoteShareLinkService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  private tokenKey(): Buffer {
    return createHash('sha256')
      .update(this.config.getOrThrow<string>('app.jwtSecret'))
      .digest();
  }

  private encryptToken(token: string): string {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.tokenKey(), iv);
    const encrypted = Buffer.concat([
      cipher.update(token, 'utf8'),
      cipher.final(),
    ]);
    return [iv, cipher.getAuthTag(), encrypted]
      .map((part) => part.toString('base64url'))
      .join('.');
  }

  private decryptToken(payload: string): string {
    const [iv, tag, encrypted] = payload
      .split('.')
      .map((part) => Buffer.from(part, 'base64url'));
    if (!iv || !tag || !encrypted) throw new Error('Token cifrado inválido');
    const decipher = createDecipheriv('aes-256-gcm', this.tokenKey(), iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]).toString('utf8');
  }

  calculateExpiry(validUntil?: Date | null, now = new Date()): Date {
    const configuredExpiry = new Date(now);
    configuredExpiry.setUTCDate(
      configuredExpiry.getUTCDate() +
        this.config.getOrThrow<number>('app.quoteShareDefaultDays'),
    );
    return validUntil && validUntil < configuredExpiry
      ? validUntil
      : configuredExpiry;
  }

  buildPublicUrl(token: string): string {
    const baseUrl = this.config
      .getOrThrow<string>('app.publicAppUrl')
      .replace(/\/$/, '');
    return `${baseUrl}/p/${encodeURIComponent(token)}`;
  }

  private async replaceLink(
    tx: Prisma.TransactionClient,
    quoteId: string,
    expiresAt: Date,
    now: Date,
  ) {
    const token = generateShareToken();
    await tx.quoteShareLink.updateMany({
      where: { quoteId, revokedAt: null, respondedAt: null },
      data: { revokedAt: now },
    });
    const link = await tx.quoteShareLink.create({
      data: {
        quoteId,
        tokenHash: hashShareToken(token),
        tokenCiphertext: this.encryptToken(token),
        expiresAt,
      },
    });
    return { link, token };
  }

  async replaceActiveLink(quoteId: string, expiresAt: Date) {
    const now = new Date();
    const { link, token } = await this.prisma.$transaction((tx) =>
      this.replaceLink(tx, quoteId, expiresAt, now),
    );
    return { link, token, publicUrl: this.buildPublicUrl(token) };
  }

  revokeActiveLink(quoteId: string) {
    return this.prisma.quoteShareLink.updateMany({
      where: { quoteId, revokedAt: null, respondedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async generateForOwner(userId: string, quoteId: string) {
    const existing = await this.getForOwner(userId, quoteId);
    if (existing) return existing;
    const now = new Date();
    const result = await this.prisma.$transaction(async (tx) => {
      const quote = await tx.quote.findFirst({
        where: { id: quoteId, userId },
        select: { id: true, status: true, validUntil: true },
      });
      if (!quote) throw new NotFoundException('Presupuesto no encontrado');
      if (
        quote.status !== QuoteStatus.DRAFT &&
        quote.status !== QuoteStatus.SENT
      ) {
        throw new ConflictException(
          'Solo se pueden compartir presupuestos en borrador o enviados',
        );
      }

      const expiresAt = this.calculateExpiry(quote.validUntil, now);
      if (expiresAt <= now) {
        throw new BadRequestException('La vigencia del presupuesto terminó');
      }

      const created = await this.replaceLink(tx, quote.id, expiresAt, now);
      return { ...created, expiresAt };
    });

    return {
      publicUrl: this.buildPublicUrl(result.token),
      expiresAt: result.expiresAt,
    };
  }

  async getForOwner(userId: string, quoteId: string) {
    const link = await this.prisma.quoteShareLink.findFirst({
      where: {
        quoteId,
        quote: { userId },
        revokedAt: null,
        respondedAt: null,
        expiresAt: { gt: new Date() },
        tokenCiphertext: { not: null },
      },
      orderBy: { createdAt: 'desc' },
      select: { tokenCiphertext: true, expiresAt: true },
    });
    if (!link?.tokenCiphertext) return null;
    return {
      publicUrl: this.buildPublicUrl(this.decryptToken(link.tokenCiphertext)),
      expiresAt: link.expiresAt,
    };
  }

  async revokeForOwner(userId: string, quoteId: string) {
    return this.prisma.$transaction(async (tx) => {
      const quote = await tx.quote.findFirst({
        where: { id: quoteId, userId },
        select: { id: true },
      });
      if (!quote) throw new NotFoundException('Presupuesto no encontrado');
      const result = await tx.quoteShareLink.updateMany({
        where: { quoteId, revokedAt: null, respondedAt: null },
        data: { revokedAt: new Date() },
      });
      return { revoked: result.count > 0 };
    });
  }

  private async findPublicLink(token: string) {
    const link = await this.prisma.quoteShareLink.findUnique({
      where: { tokenHash: hashShareToken(token) },
      select: {
        id: true,
        expiresAt: true,
        revokedAt: true,
        respondedAt: true,
        decision: true,
        quote: { select: publicQuoteSelect },
      },
    });
    if (
      !link ||
      link.revokedAt ||
      link.respondedAt ||
      link.expiresAt <= new Date()
    ) {
      throw new NotFoundException('Enlace no disponible');
    }
    return link;
  }

  async getPublicQuote(token: string) {
    const link = await this.findPublicLink(token);
    return {
      ...link.quote,
      response: link.respondedAt
        ? {
            decision: link.decision,
            respondedAt: link.respondedAt,
          }
        : null,
    };
  }

  async submitDecision(
    token: string,
    decision: QuoteDecision,
    comment?: string,
  ) {
    const tokenHash = hashShareToken(token);
    const normalizedComment = comment?.trim() || null;
    const maxLength = this.config.getOrThrow<number>(
      'app.quoteShareCommentMaxLength',
    );
    if (normalizedComment && normalizedComment.length > maxLength) {
      throw new BadRequestException(
        `El comentario no puede superar ${maxLength} caracteres`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const now = new Date();
      const link = await tx.quoteShareLink.findUnique({
        where: { tokenHash },
        select: {
          id: true,
          quoteId: true,
          expiresAt: true,
          revokedAt: true,
          respondedAt: true,
          decision: true,
          quote: { select: { status: true } },
        },
      });
      if (!link || link.revokedAt || link.expiresAt <= now) {
        throw new NotFoundException('Enlace no disponible');
      }
      if (link.respondedAt) {
        return {
          status: 'already_responded' as const,
          decision: link.decision,
          respondedAt: link.respondedAt,
        };
      }
      if (link.quote.status !== QuoteStatus.SENT) {
        throw new ConflictException('El presupuesto ya no admite respuestas');
      }

      const claimed = await tx.quoteShareLink.updateMany({
        where: {
          id: link.id,
          revokedAt: null,
          respondedAt: null,
          expiresAt: { gt: now },
        },
        data: { decision, comment: normalizedComment, respondedAt: now },
      });
      if (claimed.count !== 1) {
        throw new ConflictException('El presupuesto ya fue respondido');
      }

      const quoteUpdated = await tx.quote.updateMany({
        where: { id: link.quoteId, status: QuoteStatus.SENT },
        data: {
          status:
            decision === QuoteDecision.APPROVED
              ? QuoteStatus.APPROVED
              : QuoteStatus.REJECTED,
        },
      });
      if (quoteUpdated.count !== 1) {
        throw new ConflictException('El presupuesto ya no admite respuestas');
      }

      return { status: 'recorded' as const, decision, respondedAt: now };
    });
  }
}
