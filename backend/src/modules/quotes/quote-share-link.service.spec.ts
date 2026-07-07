/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import type { ConfigService } from '@nestjs/config';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { QuoteDecision, QuoteStatus } from '@prisma/client';
import type { PrismaService } from '../../prisma/prisma.service';
import { QuoteShareLinkService } from './quote-share-link.service';

describe('QuoteShareLinkService', () => {
  const linkUpdateMany = jest.fn();
  const linkCreate = jest.fn();
  const linkFindUnique = jest.fn();
  const linkFindFirst = jest.fn();
  const quoteFindFirst = jest.fn();
  const quoteUpdate = jest.fn();
  const quoteUpdateMany = jest.fn();
  const tx = {
    quoteShareLink: {
      updateMany: linkUpdateMany,
      create: linkCreate,
      findUnique: linkFindUnique,
    },
    quote: {
      findFirst: quoteFindFirst,
      update: quoteUpdate,
      updateMany: quoteUpdateMany,
    },
  };
  const prisma = {
    quoteShareLink: {
      updateMany: linkUpdateMany,
      findUnique: linkFindUnique,
      findFirst: linkFindFirst,
    },
    $transaction: jest.fn((callback: (client: unknown) => unknown) =>
      Promise.resolve(callback(tx)),
    ),
  };
  const config = {
    getOrThrow: jest.fn((key: string) => {
      if (key === 'app.quoteShareDefaultDays') return 30;
      if (key === 'app.quoteShareCommentMaxLength') return 1000;
      if (key === 'app.jwtSecret') return 'test-secret-with-enough-entropy';
      return 'http://localhost:3000/';
    }),
  };
  const service = new QuoteShareLinkService(
    prisma as unknown as PrismaService,
    config as unknown as ConfigService,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    linkFindFirst.mockResolvedValue(null);
  });

  it('revoca el enlace activo antes de crear uno nuevo', async () => {
    linkCreate.mockResolvedValue({ id: 'link-1' });

    const result = await service.replaceActiveLink(
      'quote-1',
      new Date('2026-08-01T00:00:00.000Z'),
    );

    expect(linkUpdateMany).toHaveBeenCalledWith({
      where: { quoteId: 'quote-1', revokedAt: null, respondedAt: null },
      data: { revokedAt: expect.any(Date) },
    });
    expect(linkCreate).toHaveBeenCalledWith({
      data: {
        quoteId: 'quote-1',
        tokenHash: expect.any(String),
        tokenCiphertext: expect.any(String),
        expiresAt: new Date('2026-08-01T00:00:00.000Z'),
      },
    });
    expect(result.publicUrl).toMatch(/^http:\/\/localhost:3000\/p\//);
    expect(result.publicUrl).toContain(result.token);
    expect(result.link).toEqual({ id: 'link-1' });
  });

  it('genera el enlace de un borrador sin cambiarlo a enviado', async () => {
    quoteFindFirst.mockResolvedValue({
      id: 'quote-1',
      status: QuoteStatus.DRAFT,
      validUntil: new Date(Date.now() + 86_400_000),
    });
    linkCreate.mockResolvedValue({ id: 'link-1' });

    const result = await service.generateForOwner('user-1', 'quote-1');

    expect(quoteFindFirst).toHaveBeenCalledWith({
      where: { id: 'quote-1', userId: 'user-1' },
      select: { id: true, status: true, validUntil: true },
    });
    expect(quoteUpdate).not.toHaveBeenCalled();
    expect(result.publicUrl).toMatch(/^http:\/\/localhost:3000\/p\//);
  });

  it('recupera la misma URL cifrada para el propietario', async () => {
    linkCreate.mockResolvedValue({ id: 'link-1' });
    const created = await service.replaceActiveLink(
      'quote-1',
      new Date('2026-08-01T00:00:00.000Z'),
    );
    const ciphertext = linkCreate.mock.calls[0][0].data
      .tokenCiphertext as string;
    linkFindFirst.mockResolvedValue({
      tokenCiphertext: ciphertext,
      expiresAt: new Date('2026-08-01T00:00:00.000Z'),
    });

    await expect(service.getForOwner('user-1', 'quote-1')).resolves.toEqual({
      publicUrl: created.publicUrl,
      expiresAt: new Date('2026-08-01T00:00:00.000Z'),
    });
  });

  it('registra una aceptación y actualiza el presupuesto atómicamente', async () => {
    linkFindUnique.mockResolvedValue({
      id: 'link-1',
      quoteId: 'quote-1',
      expiresAt: new Date(Date.now() + 86_400_000),
      revokedAt: null,
      respondedAt: null,
      decision: null,
      quote: { status: QuoteStatus.SENT },
    });
    linkUpdateMany.mockResolvedValue({ count: 1 });
    quoteUpdateMany.mockResolvedValue({ count: 1 });

    const result = await service.submitDecision(
      'public-token',
      QuoteDecision.APPROVED,
      ' Aceptado ',
    );

    expect(linkUpdateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          decision: QuoteDecision.APPROVED,
          comment: 'Aceptado',
        }),
      }),
    );
    expect(quoteUpdateMany).toHaveBeenCalledWith({
      where: { id: 'quote-1', status: QuoteStatus.SENT },
      data: { status: QuoteStatus.APPROVED },
    });
    expect(result.status).toBe('recorded');
  });

  it('conserva la primera respuesta cuando el enlace ya fue respondido', async () => {
    const respondedAt = new Date();
    linkFindUnique.mockResolvedValue({
      id: 'link-1',
      quoteId: 'quote-1',
      expiresAt: new Date(Date.now() + 86_400_000),
      revokedAt: null,
      respondedAt,
      decision: QuoteDecision.REJECTED,
      quote: { status: QuoteStatus.REJECTED },
    });

    const result = await service.submitDecision(
      'public-token',
      QuoteDecision.APPROVED,
    );

    expect(result).toEqual({
      status: 'already_responded',
      decision: QuoteDecision.REJECTED,
      respondedAt,
    });
    expect(quoteUpdateMany).not.toHaveBeenCalled();
  });

  it('limita el vencimiento a la vigencia del presupuesto', () => {
    const expiry = service.calculateExpiry(
      new Date('2026-07-10T00:00:00.000Z'),
      new Date('2026-07-01T00:00:00.000Z'),
    );

    expect(expiry).toEqual(new Date('2026-07-10T00:00:00.000Z'));
  });

  it('revoca solamente el enlace activo del presupuesto propio', async () => {
    quoteFindFirst.mockResolvedValue({ id: 'quote-1' });
    linkUpdateMany.mockResolvedValue({ count: 1 });
    await expect(service.revokeForOwner('user-1', 'quote-1')).resolves.toEqual({
      revoked: true,
    });
    expect(linkUpdateMany).toHaveBeenCalledWith({
      where: { quoteId: 'quote-1', revokedAt: null, respondedAt: null },
      data: { revokedAt: expect.any(Date) },
    });
  });

  it('no revela un presupuesto ajeno al intentar compartirlo', async () => {
    quoteFindFirst.mockResolvedValue(null);
    await expect(
      service.generateForOwner('other-user', 'quote-1'),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(linkCreate).not.toHaveBeenCalled();
  });

  it('rechaza enlaces vencidos con el mismo error público', async () => {
    linkFindUnique.mockResolvedValue({
      expiresAt: new Date(Date.now() - 1_000),
      revokedAt: null,
      quote: {},
    });
    await expect(service.getPublicQuote('expired-token')).rejects.toThrow(
      'Enlace no disponible',
    );
  });

  it('proyecta solo datos públicos y excluye identidad privada', async () => {
    linkFindUnique.mockResolvedValue({
      expiresAt: new Date(Date.now() + 86_400_000),
      revokedAt: null,
      respondedAt: null,
      decision: null,
      quote: { number: 12, user: { businessName: 'Taller Norte' } },
    });
    const result = await service.getPublicQuote('public-token');
    const query = linkFindUnique.mock.calls[0][0] as {
      select: { quote: { select: Record<string, unknown> } };
    };
    expect(result).toEqual({
      number: 12,
      user: { businessName: 'Taller Norte' },
      response: null,
    });
    expect(query.select.quote.select).not.toHaveProperty('id');
    expect(query.select.quote.select.user).toEqual({
      select: { name: true, businessName: true, taxId: true },
    });
  });

  it('confirma una sola decisión cuando llegan respuestas concurrentes', async () => {
    linkFindUnique.mockResolvedValue({
      id: 'link-1',
      quoteId: 'quote-1',
      expiresAt: new Date(Date.now() + 86_400_000),
      revokedAt: null,
      respondedAt: null,
      decision: null,
      quote: { status: QuoteStatus.SENT },
    });
    linkUpdateMany
      .mockResolvedValueOnce({ count: 1 })
      .mockResolvedValueOnce({ count: 0 });
    quoteUpdateMany.mockResolvedValue({ count: 1 });
    const outcomes = await Promise.allSettled([
      service.submitDecision('public-token', QuoteDecision.APPROVED),
      service.submitDecision('public-token', QuoteDecision.REJECTED),
    ]);
    expect(
      outcomes.filter((outcome) => outcome.status === 'fulfilled'),
    ).toHaveLength(1);
    const rejected = outcomes.find(
      (outcome): outcome is PromiseRejectedResult =>
        outcome.status === 'rejected',
    );
    expect(rejected?.reason).toBeInstanceOf(ConflictException);
  });
});
