import { z } from 'zod';
import {
  AI_QUOTE_DRAFT_ITEMS_MAX_LENGTH,
  AI_QUOTE_DRAFT_WARNINGS_MAX_LENGTH,
} from './quote-draft.constants';

export const quoteDraftResponseSchema = z
  .object({
    customerName: z.string().max(160),
    customerMatchId: z.string().min(1).max(128).nullable(),
    items: z
      .array(
        z
          .object({
            description: z.string().min(1).max(500),
            quantity: z.number().positive().max(999999),
            unit: z.string().min(1).max(30),
            catalogMatchId: z.string().min(1).max(128).nullable(),
          })
          .strict(),
      )
      .min(1)
      .max(AI_QUOTE_DRAFT_ITEMS_MAX_LENGTH),
    notes: z.string().max(2000),
    validUntilDays: z.number().int().min(1).max(365).nullable(),
    warnings: z
      .array(z.string().min(1).max(240))
      .max(AI_QUOTE_DRAFT_WARNINGS_MAX_LENGTH),
  })
  .strict();

export type QuoteDraftResponse = z.infer<typeof quoteDraftResponseSchema>;

export const quoteDraftStructuredOutputSchema = {
  type: 'json_schema',
  name: 'quote_draft',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      customerName: {
        type: 'string',
        description:
          'Suggested customer name extracted from the description, or an empty string if unknown.',
      },
      customerMatchId: {
        anyOf: [{ type: 'string' }, { type: 'null' }],
        description:
          'Existing customer id when the match is reliable, otherwise null.',
      },
      items: {
        type: 'array',
        minItems: 1,
        maxItems: AI_QUOTE_DRAFT_ITEMS_MAX_LENGTH,
        items: {
          type: 'object',
          additionalProperties: false,
          properties: {
            description: {
              type: 'string',
              description: 'Line item description for the quote form.',
            },
            quantity: {
              type: 'number',
              exclusiveMinimum: 0,
              maximum: 999999,
            },
            unit: {
              type: 'string',
              description: 'Unit such as unidad, servicio, hora or metro.',
            },
            catalogMatchId: {
              anyOf: [{ type: 'string' }, { type: 'null' }],
              description:
                'Existing catalog item id when the match is reliable, otherwise null.',
            },
          },
          required: ['description', 'quantity', 'unit', 'catalogMatchId'],
        },
      },
      notes: {
        type: 'string',
        description: 'Commercial notes suggested for the quote.',
      },
      validUntilDays: {
        anyOf: [
          { type: 'integer', minimum: 1, maximum: 365 },
          { type: 'null' },
        ],
        description:
          'Number of days the quote should remain valid, or null if not specified.',
      },
      warnings: {
        type: 'array',
        maxItems: AI_QUOTE_DRAFT_WARNINGS_MAX_LENGTH,
        items: { type: 'string' },
        description:
          'Non-blocking uncertainties the owner should review before saving.',
      },
    },
    required: [
      'customerName',
      'customerMatchId',
      'items',
      'notes',
      'validUntilDays',
      'warnings',
    ],
  },
} as const;

export function parseQuoteDraftResponse(value: unknown): QuoteDraftResponse {
  return quoteDraftResponseSchema.parse(value);
}
