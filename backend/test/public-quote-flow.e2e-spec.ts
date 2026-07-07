/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  ExecutionContext,
  INestApplication,
  NotFoundException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ThrottlerGuard } from '@nestjs/throttler';
import { QuoteDecision, QuoteStatus } from '@prisma/client';
import request from 'supertest';
import { App } from 'supertest/types';
import { JwtAuthGuard } from '../src/modules/auth/jwt-auth.guard';
import { PdfService } from '../src/modules/quotes/pdf.service';
import { PublicQuotesController } from '../src/modules/quotes/public-quotes.controller';
import { QuoteShareLinkService } from '../src/modules/quotes/quote-share-link.service';
import { QuotesController } from '../src/modules/quotes/quotes.controller';
import { QuotesService } from '../src/modules/quotes/quotes.service';

describe('Public quote approval flow (e2e)', () => {
  let app: INestApplication<App>;
  const token = 'public-token-with-high-entropy-placeholder';
  const quote = {
    id: 'quote-1',
    userId: 'owner-1',
    number: 42,
    status: QuoteStatus.DRAFT as QuoteStatus,
    issueDate: new Date('2026-07-01T00:00:00.000Z'),
    validUntil: new Date('2026-08-01T00:00:00.000Z'),
    currency: 'ARS',
    notes: 'Entrega incluida',
    subtotal: '1000.00',
    discountTotal: '0.00',
    taxTotal: '210.00',
    total: '1210.00',
    user: {
      name: 'Propietario',
      businessName: 'Taller Norte',
      taxId: '20-12345678-9',
    },
    customer: {
      name: 'Cliente Demo',
      businessName: null,
      taxId: null,
      address: 'Calle 123',
    },
    items: [
      {
        description: 'Servicio técnico',
        quantity: '1',
        unit: 'unidad',
        unitPrice: '1000.00',
        taxRate: '21',
        lineSubtotal: '1000.00',
        lineTax: '210.00',
        lineTotal: '1210.00',
        position: 0,
      },
    ],
  };
  let response: { decision: QuoteDecision; respondedAt: Date } | null;
  const publicProjection = () => ({
    number: quote.number,
    status: quote.status,
    issueDate: quote.issueDate,
    validUntil: quote.validUntil,
    currency: quote.currency,
    notes: quote.notes,
    subtotal: quote.subtotal,
    discountTotal: quote.discountTotal,
    taxTotal: quote.taxTotal,
    total: quote.total,
    user: quote.user,
    customer: quote.customer,
    items: quote.items,
    response,
  });
  const shares = {
    generateForOwner: jest.fn((userId: string, quoteId: string) => {
      if (userId !== quote.userId || quoteId !== quote.id)
        throw new NotFoundException('Presupuesto no encontrado');
      return {
        publicUrl: `http://localhost:3000/p/${token}`,
        expiresAt: quote.validUntil,
      };
    }),
    getForOwner: jest.fn(() => ({
      publicUrl: `http://localhost:3000/p/${token}`,
      expiresAt: quote.validUntil,
    })),
    revokeForOwner: jest.fn(),
    getPublicQuote: jest.fn((receivedToken: string) => {
      if (receivedToken !== token)
        throw new NotFoundException('Enlace no disponible');
      return publicProjection();
    }),
    submitDecision: jest.fn(
      (receivedToken: string, decision: QuoteDecision) => {
        if (receivedToken !== token)
          throw new NotFoundException('Enlace no disponible');
        if (response) return { status: 'already_responded', ...response };
        quote.status =
          decision === QuoteDecision.APPROVED
            ? QuoteStatus.APPROVED
            : QuoteStatus.REJECTED;
        response = { decision, respondedAt: new Date() };
        return { status: 'recorded', ...response };
      },
    ),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [QuotesController, PublicQuotesController],
      providers: [
        {
          provide: QuotesService,
          useValue: {
            create: () => quote,
            get: () => quote,
            markSentIfDraft: () => {
              if (quote.status === QuoteStatus.DRAFT)
                quote.status = QuoteStatus.SENT;
              return quote;
            },
          },
        },
        { provide: PdfService, useValue: {} },
        { provide: QuoteShareLinkService, useValue: shares },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate(context: ExecutionContext) {
          const req = context.switchToHttp().getRequest<{
            headers: Record<string, string | undefined>;
            user?: { id: string; email: string };
          }>();
          req.user = {
            id: req.headers['x-test-user'] ?? 'owner-1',
            email: 'owner@example.test',
          };
          return true;
        },
      })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  beforeEach(() => {
    quote.status = QuoteStatus.DRAFT;
    response = null;
    jest.clearAllMocks();
  });

  it('recorre propietario → enlace público → cliente → estado aprobado', async () => {
    const shared = await request(app.getHttpServer())
      .post('/api/quotes')
      .send({})
      .expect(201);
    expect(shared.body.activeShare.publicUrl).toContain(`/p/${token}`);
    expect(quote.status).toBe(QuoteStatus.DRAFT);
    await request(app.getHttpServer())
      .post(`/api/quotes/${quote.id}/share/copied`)
      .expect(201);
    expect(quote.status).toBe(QuoteStatus.SENT);
    const publicView = await request(app.getHttpServer())
      .get(`/api/public/quotes/${token}`)
      .expect(200);
    expect(publicView.body).toMatchObject({
      number: 42,
      status: QuoteStatus.SENT,
      user: { businessName: 'Taller Norte' },
      total: '1210.00',
    });
    expect(JSON.stringify(publicView.body)).not.toContain('owner@example.test');
    expect(publicView.body).not.toHaveProperty('id');
    expect(publicView.body).not.toHaveProperty('tokenHash');
    await request(app.getHttpServer())
      .post(`/api/public/quotes/${token}/decision`)
      .send({ decision: QuoteDecision.APPROVED, comment: 'De acuerdo' })
      .expect(201)
      .expect(({ body }) => expect(body.status).toBe('recorded'));
    expect(quote.status).toBe(QuoteStatus.APPROVED);
    await request(app.getHttpServer())
      .post(`/api/public/quotes/${token}/decision`)
      .send({ decision: QuoteDecision.REJECTED })
      .expect(201)
      .expect(({ body }) => {
        expect(body.status).toBe('already_responded');
        expect(body.decision).toBe(QuoteDecision.APPROVED);
      });
  });

  it('no permite compartir un presupuesto desde otra cuenta', () =>
    request(app.getHttpServer())
      .post(`/api/quotes/${quote.id}/share`)
      .set('x-test-user', 'other-owner')
      .expect(404));

  it('responde igual para tokens públicos inexistentes', () =>
    request(app.getHttpServer())
      .get('/api/public/quotes/unknown-token')
      .expect(404)
      .expect(({ body }) => expect(body.message).toBe('Enlace no disponible')));

  afterAll(async () => {
    await app.close();
  });
});
