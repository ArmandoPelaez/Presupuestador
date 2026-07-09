import {
  parseQuoteDraftResponse,
  quoteDraftStructuredOutputSchema,
} from './quote-draft.schema';

const validDraft = {
  customerName: 'Juan Perez',
  customerMatchId: null,
  items: [
    {
      description: 'Instalacion de camara',
      quantity: 3,
      unit: 'unidad',
      catalogMatchId: null,
    },
  ],
  notes: 'Presupuesto sujeto a revision tecnica.',
  validUntilDays: 10,
  warnings: ['Revisar precios antes de guardar.'],
};

describe('quote draft schema', () => {
  it('define Structured Outputs con JSON Schema estricto', () => {
    expect(quoteDraftStructuredOutputSchema).toMatchObject({
      type: 'json_schema',
      name: 'quote_draft',
      strict: true,
    });
    expect(quoteDraftStructuredOutputSchema.schema).toMatchObject({
      type: 'object',
      additionalProperties: false,
    });
    expect(quoteDraftStructuredOutputSchema.schema.required).toEqual([
      'customerName',
      'customerMatchId',
      'items',
      'notes',
      'validUntilDays',
      'warnings',
    ]);
  });

  it('acepta un borrador con la forma esperada', () => {
    expect(parseQuoteDraftResponse(validDraft)).toEqual(validDraft);
  });

  it('rechaza campos extra, items vacios y cantidades invalidas', () => {
    expect(() =>
      parseQuoteDraftResponse({ ...validDraft, unexpected: true }),
    ).toThrow();
    expect(() =>
      parseQuoteDraftResponse({ ...validDraft, items: [] }),
    ).toThrow();
    expect(() =>
      parseQuoteDraftResponse({
        ...validDraft,
        items: [{ ...validDraft.items[0], quantity: 0 }],
      }),
    ).toThrow();
  });
});
