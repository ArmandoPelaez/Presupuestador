import {
  BadGatewayException,
  Inject,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { GenerateQuoteDraftDto } from './dto/generate-quote-draft.dto';
import type { GenerateQuoteDraftResponseDto } from './dto/generate-quote-draft.dto';
import { OPENAI_CLIENT } from './openai-client.provider';
import {
  parseQuoteDraftResponse,
  quoteDraftStructuredOutputSchema,
} from './quote-draft.schema';

interface QuoteDraftCandidateContext {
  customers: Array<{
    id: string;
    name: string;
    businessName: string | null;
  }>;
  catalogItems: Array<{
    id: string;
    type: string;
    name: string;
    unitPrice: string;
  }>;
}

export interface OpenAiResponsesClient {
  responses: {
    create(params: {
      model: string;
      input: Array<{ role: 'system' | 'user'; content: string }>;
      text: { format: typeof quoteDraftStructuredOutputSchema };
    }): Promise<{ output_text?: string | null }>;
  };
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    @Inject(OPENAI_CLIENT)
    private readonly openai: OpenAiResponsesClient | null,
  ) {}

  async generateQuoteDraft(
    userId: string,
    dto: GenerateQuoteDraftDto,
  ): Promise<GenerateQuoteDraftResponseDto> {
    if (!this.openai) {
      throw new ServiceUnavailableException('IA no configurada');
    }

    const context = await this.getCandidateContext(userId, dto.description);
    const response = await this.createOpenAiDraft(dto.description, context);
    const parsed = this.parseProviderDraft(response);

    return this.normalizeDraft(parsed, context);
  }

  async getCandidateContext(
    userId: string,
    description: string,
  ): Promise<QuoteDraftCandidateContext> {
    const terms = this.extractSearchTerms(description);
    const customerWhere = {
      userId,
      isActive: true,
      ...(terms.length
        ? {
            OR: terms.flatMap((term) => [
              { name: { contains: term } },
              { businessName: { contains: term } },
            ]),
          }
        : {}),
    };
    const catalogWhere = {
      userId,
      isActive: true,
      ...(terms.length
        ? {
            OR: terms.map((term) => ({ name: { contains: term } })),
          }
        : {}),
    };

    let [customers, catalogItems] = await this.prisma.$transaction([
      this.prisma.customer.findMany({
        where: customerWhere,
        orderBy: { updatedAt: 'desc' },
        take: 10,
        select: { id: true, name: true, businessName: true },
      }),
      this.prisma.catalogItem.findMany({
        where: catalogWhere,
        orderBy: { updatedAt: 'desc' },
        take: 30,
        select: { id: true, type: true, name: true, unitPrice: true },
      }),
    ]);

    if (!customers.length) {
      customers = await this.prisma.customer.findMany({
        where: { userId, isActive: true },
        orderBy: { updatedAt: 'desc' },
        take: 10,
        select: { id: true, name: true, businessName: true },
      });
    }

    if (!catalogItems.length) {
      catalogItems = await this.prisma.catalogItem.findMany({
        where: { userId, isActive: true },
        orderBy: { updatedAt: 'desc' },
        take: 30,
        select: { id: true, type: true, name: true, unitPrice: true },
      });
    }

    return {
      customers,
      catalogItems: catalogItems.map((item) => ({
        ...item,
        unitPrice: item.unitPrice.toString(),
      })),
    };
  }

  private async createOpenAiDraft(
    description: string,
    context: QuoteDraftCandidateContext,
  ): Promise<unknown> {
    try {
      const response = await this.openai?.responses.create({
        model: this.config.getOrThrow<string>('app.openAiModel'),
        input: [
          {
            role: 'system',
            content: this.buildSystemPrompt(),
          },
          {
            role: 'user',
            content: JSON.stringify({
              description,
              customers: context.customers,
              catalogItems: context.catalogItems,
            }),
          },
        ],
        text: {
          format: quoteDraftStructuredOutputSchema,
        },
      });

      if (!response?.output_text) {
        throw new Error('missing_output_text');
      }

      return JSON.parse(response.output_text) as unknown;
    } catch (error) {
      this.logger.warn(
        `OpenAI quote draft generation failed: ${this.errorName(error)}`,
      );
      throw new BadGatewayException('No se pudo generar el borrador con IA');
    }
  }

  private normalizeDraft(
    draft: GenerateQuoteDraftResponseDto,
    context: QuoteDraftCandidateContext,
  ): GenerateQuoteDraftResponseDto {
    const customerIds = new Set(
      context.customers.map((customer) => customer.id),
    );
    const catalogIds = new Set(context.catalogItems.map((item) => item.id));
    const warnings = [...draft.warnings];
    const customerMatchId =
      draft.customerMatchId && customerIds.has(draft.customerMatchId)
        ? draft.customerMatchId
        : null;

    if (draft.customerMatchId && !customerMatchId) {
      warnings.push(
        'La coincidencia de cliente sugerida no estaba disponible.',
      );
    }

    const items = draft.items.map((item) => {
      const catalogMatchId =
        item.catalogMatchId && catalogIds.has(item.catalogMatchId)
          ? item.catalogMatchId
          : null;

      if (item.catalogMatchId && !catalogMatchId) {
        warnings.push(
          `La coincidencia de catalogo para "${item.description}" no estaba disponible.`,
        );
      }

      return { ...item, catalogMatchId };
    });

    return {
      ...draft,
      customerMatchId,
      items,
      warnings: [...new Set(warnings)].slice(0, 10),
    };
  }

  private parseProviderDraft(value: unknown): GenerateQuoteDraftResponseDto {
    try {
      return parseQuoteDraftResponse(value);
    } catch (error) {
      this.logger.warn(
        `OpenAI quote draft validation failed: ${this.errorName(error)}`,
      );
      throw new BadGatewayException('No se pudo generar el borrador con IA');
    }
  }

  private buildSystemPrompt(): string {
    return [
      'Sos un asistente de presupuestos para pequenos negocios.',
      'Converti la descripcion del usuario en un borrador JSON para precargar un formulario.',
      'Usa solamente customerMatchId y catalogMatchId que aparezcan en el contexto provisto.',
      'No inventes precios, totales, impuestos, descuentos, estados ni numeros de presupuesto.',
      'Si falta informacion importante, agregala en warnings y deja campos editables.',
      'Responde exclusivamente con el JSON que respeta el schema.',
    ].join(' ');
  }

  private extractSearchTerms(description: string): string[] {
    const ignored = new Set([
      'para',
      'por',
      'con',
      'los',
      'las',
      'una',
      'uno',
      'del',
      'que',
      'presupuesto',
    ]);

    return [
      ...new Set(
        description
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .split(/[^a-z0-9]+/)
          .filter((term) => term.length >= 3 && !ignored.has(term)),
      ),
    ].slice(0, 6);
  }

  private errorName(error: unknown): string {
    return error instanceof Error ? error.name : 'UnknownError';
  }
}
