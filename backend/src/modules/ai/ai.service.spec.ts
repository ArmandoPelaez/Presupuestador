/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  BadGatewayException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from './ai.service';
import type { OpenAiResponsesClient } from './ai.service';

const validOpenAiDraft = {
  customerName: 'Juan Perez',
  customerMatchId: 'customer-1',
  items: [
    {
      description: 'Instalacion de camara',
      quantity: 3,
      unit: 'unidad',
      catalogMatchId: 'catalog-1',
    },
  ],
  notes: 'Presupuesto sujeto a revision tecnica.',
  validUntilDays: 10,
  warnings: [],
};

describe('AiService', () => {
  const customers = [
    {
      id: 'customer-1',
      name: 'Juan Perez',
      businessName: null,
    },
  ];
  const catalogItems = [
    {
      id: 'catalog-1',
      type: 'SERVICE',
      name: 'Instalacion de camara',
      unitPrice: new Prisma.Decimal('1000'),
    },
  ];
  const prisma = {
    $transaction: jest.fn((queries: unknown[]) => Promise.resolve(queries)),
    customer: {
      findMany: jest.fn(() => Promise.resolve(customers)),
    },
    catalogItem: {
      findMany: jest.fn(() => Promise.resolve(catalogItems)),
    },
    quote: {
      create: jest.fn(),
      update: jest.fn(),
    },
    quoteItem: {
      create: jest.fn(),
    },
  };
  const config = {
    getOrThrow: jest.fn((key: string) => {
      if (key === 'app.openAiModel') return 'gpt-5.4-mini';
      throw new Error(`missing config ${key}`);
    }),
  };
  const openai = {
    responses: {
      create: jest.fn<Promise<{ output_text: string }>, [unknown]>(() =>
        Promise.resolve({ output_text: JSON.stringify(validOpenAiDraft) }),
      ),
    },
  };

  const buildService = (client: OpenAiResponsesClient | null = openai) =>
    new AiService(
      prisma as unknown as PrismaService,
      config as unknown as ConfigService,
      client,
    );

  beforeEach(() => jest.clearAllMocks());

  it('genera un borrador estructurado con candidatos del usuario y no persiste presupuesto', async () => {
    const result = await buildService().generateQuoteDraft('user-1', {
      description: 'Presupuesto para Juan por instalacion de 3 camaras',
    });

    expect(result).toEqual(validOpenAiDraft);
    expect(prisma.customer.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ userId: 'user-1', isActive: true }),
        take: 10,
      }),
    );
    expect(prisma.catalogItem.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ userId: 'user-1', isActive: true }),
        take: 30,
      }),
    );
    expect(openai.responses.create).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'gpt-5.4-mini',
        text: expect.objectContaining({
          format: expect.objectContaining({
            type: 'json_schema',
            strict: true,
          }),
        }),
      }),
    );
    const firstOpenAiCall = openai.responses.create.mock.calls[0][0];
    expect(JSON.stringify(firstOpenAiCall)).not.toContain('password');
    expect(prisma.quote.create).not.toHaveBeenCalled();
    expect(prisma.quote.update).not.toHaveBeenCalled();
    expect(prisma.quoteItem.create).not.toHaveBeenCalled();
  });

  it('normaliza ids inventados por la IA y agrega warnings', async () => {
    openai.responses.create.mockResolvedValueOnce({
      output_text: JSON.stringify({
        ...validOpenAiDraft,
        customerMatchId: 'other-customer',
        items: [{ ...validOpenAiDraft.items[0], catalogMatchId: 'other-item' }],
      }),
    });

    const result = await buildService().generateQuoteDraft('user-1', {
      description: 'Presupuesto para Juan por instalacion',
    });

    expect(result.customerMatchId).toBeNull();
    expect(result.items[0].catalogMatchId).toBeNull();
    expect(result.warnings.join(' ')).toContain('cliente');
    expect(result.warnings.join(' ')).toContain('catalogo');
  });

  it('rechaza respuesta invalida o fallo del proveedor sin exponer salida cruda', async () => {
    openai.responses.create.mockResolvedValueOnce({
      output_text: JSON.stringify({ invalid: true }),
    });

    await expect(
      buildService().generateQuoteDraft('user-1', {
        description: 'Presupuesto para Juan por instalacion',
      }),
    ).rejects.toBeInstanceOf(BadGatewayException);

    openai.responses.create.mockRejectedValueOnce(new Error('provider failed'));
    await expect(
      buildService().generateQuoteDraft('user-1', {
        description: 'Presupuesto para Juan por instalacion',
      }),
    ).rejects.toBeInstanceOf(BadGatewayException);
  });

  it('devuelve error seguro si OpenAI no esta configurado', async () => {
    await expect(
      buildService(null).generateQuoteDraft('user-1', {
        description: 'Presupuesto para Juan por instalacion',
      }),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
