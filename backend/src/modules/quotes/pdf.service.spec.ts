import { Prisma, QuoteStatus, DiscountType } from '@prisma/client';
import { PdfService } from './pdf.service';
import type { UsersService } from '../users/users.service';
describe('PdfService', () => {
  it('genera un PDF con importes persistidos', async () => {
    const users = {
      findPublicById: jest
        .fn()
        .mockResolvedValue({ name: 'Negocio', email: 'n@example.com' }),
    };
    const service = new PdfService(users as unknown as UsersService);
    const quote = {
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
      items: [
        {
          description: 'Servicio',
          quantity: new Prisma.Decimal(2),
          unit: 'hora',
          unitPrice: new Prisma.Decimal(100),
          lineTotal: new Prisma.Decimal(242),
        },
      ],
      subtotal: new Prisma.Decimal(200),
      discountTotal: new Prisma.Decimal(0),
      taxTotal: new Prisma.Decimal(42),
      total: new Prisma.Decimal(242),
      discountType: DiscountType.NONE,
    };
    const buffer = await service.generate('u1', quote as never);
    expect(buffer.subarray(0, 4).toString()).toBe('%PDF');
    expect(buffer.length).toBeGreaterThan(1000);
  });
});
