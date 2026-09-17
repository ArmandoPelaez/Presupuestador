import { Prisma, QuoteStatus, DiscountType } from '@prisma/client';
import { PDFParse } from 'pdf-parse';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { PdfService } from './pdf.service';
import type { UsersService } from '../users/users.service';

PDFParse.setWorker(
  pathToFileURL(join(dirname(require.resolve('pdf-parse')), 'pdf.worker.mjs'))
    .href,
);

const normalizeText = (text: string) => text.replace(/\s+/g, ' ').trim();

const extractPdf = async (buffer: Buffer) => {
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    return {
      total: result.total,
      pages: result.pages.map((page) => normalizeText(page.text)),
    };
  } finally {
    await parser.destroy();
  }
};

const createQuote = (
  items = [
    {
      description: 'Servicio',
      quantity: new Prisma.Decimal(2),
      unit: 'hora',
      unitPrice: new Prisma.Decimal(100),
      lineTotal: new Prisma.Decimal(242),
    },
  ],
) => ({
  number: 7,
  status: QuoteStatus.APPROVED,
  issueDate: new Date('2026-07-01'),
  validUntil: null,
  notes: 'Gracias',
  customer: {
    name: 'Cliente',
    businessName: null,
    email: 'c@example.com',
    phone: null,
    taxId: null,
    address: null,
  },
  items,
  subtotal: new Prisma.Decimal(200),
  discountTotal: new Prisma.Decimal(0),
  taxTotal: new Prisma.Decimal(42),
  total: new Prisma.Decimal(242),
  discountType: DiscountType.NONE,
});

const createThreePageQuote = () => {
  const items = Array.from({ length: 50 }, (_, index) => ({
    description: `Item ${index + 1}`,
    quantity: new Prisma.Decimal(1),
    unit: 'unidad',
    unitPrice: new Prisma.Decimal(100),
    lineTotal: new Prisma.Decimal(100),
  }));

  return {
    ...createQuote(items),
    notes: 'Notas del presupuesto de tres páginas',
    subtotal: new Prisma.Decimal(5000),
    discountTotal: new Prisma.Decimal(250),
    taxTotal: new Prisma.Decimal(997.5),
    total: new Prisma.Decimal(5747.5),
  };
};

describe('PdfService', () => {
  it('genera un PDF con importes persistidos', async () => {
    const users = {
      findPublicById: jest
        .fn()
        .mockResolvedValue({ name: 'Negocio', email: 'n@example.com' }),
    };
    const service = new PdfService(users as unknown as UsersService);
    const quote = createQuote();
    const buffer = await service.generate('u1', quote as never);
    expect(buffer.subarray(0, 4).toString()).toBe('%PDF');
    expect(buffer.length).toBeGreaterThan(1000);
  });

  it('genera exactamente una página y la numera dentro del PDF', async () => {
    const users = {
      findPublicById: jest.fn().mockResolvedValue({
        name: 'Negocio',
        email: 'n@example.com',
      }),
    };
    const service = new PdfService(users as unknown as UsersService);
    const pdf = await extractPdf(
      await service.generate('u1', createQuote() as never),
    );

    expect(pdf.total).toBe(1);
    expect(pdf.pages).toHaveLength(1);
    expect(pdf.pages[0]).toContain('Página 1 de 1');
    expect(pdf.pages[0]).toContain('Descripción');
    expect(pdf.pages[0]).toContain('Cliente');
    expect(pdf.pages[0]).toContain('Servicio');
    expect(pdf.pages[0]).toContain('Gracias');
    expect(pdf.pages[0]).toContain('Subtotal $ 200');
    expect(pdf.pages[0]).toContain('Descuento $ 0');
    expect(pdf.pages[0]).toContain('Impuestos $ 42');
    expect(pdf.pages[0]).toContain('TOTAL $ 242');
  });

  it('genera exactamente tres páginas, conserva los encabezados y numera cada página', async () => {
    const users = {
      findPublicById: jest.fn().mockResolvedValue({
        businessName: 'Negocio',
        taxId: '20-12345678-9',
      }),
    };
    const service = new PdfService(users as unknown as UsersService);
    const pdf = await extractPdf(
      await service.generate('u1', createThreePageQuote() as never),
    );
    const { pages } = pdf;

    expect(pdf.total).toBe(3);
    expect(pages).toHaveLength(3);
    expect(pages[0]).toContain('Página 1 de 3');
    expect(pages[1]).toContain('Página 2 de 3');
    expect(pages[2]).toContain('Página 3 de 3');

    for (const page of pages) {
      expect(page).toContain('Descripción');
      expect(page).toContain('Cantidad');
      expect(page).toContain('Precio');
      expect(page).toContain('Total');
    }

    const documentText = pages.join(' ');
    expect(documentText).toContain('Negocio');
    expect(documentText).toContain('20-12345678-9');
    expect(documentText).toContain('Cliente');
    expect(documentText).toContain('Item 1');
    expect(documentText).toContain('Item 50');
    expect(documentText).toContain('Notas del presupuesto de tres páginas');
    expect(documentText).toContain('Subtotal $ 5000');
    expect(documentText).toContain('Descuento $ 250');
    expect(documentText).toContain('Impuestos $ 997.5');
    expect(documentText).toContain('TOTAL $ 5747.5');
  });
});
