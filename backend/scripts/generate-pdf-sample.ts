import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { DiscountType, Prisma, QuoteStatus } from '@prisma/client';
import { PdfService } from '../src/modules/quotes/pdf.service';

const users = { findPublicById: async () => ({ name: 'Estudio Creativo del Litoral', email: 'hola@estudio.example', businessName: 'Estudio Creativo del Litoral', taxId: '30-12345678-9' }) };
const service = new PdfService(users as never);
const items = Array.from({ length: 32 }, (_, index) => ({ description: `Servicio profesional ${index + 1}: descripción extensa para comprobar ajuste de texto y paginación`, quantity: new Prisma.Decimal('1.5'), unit: 'hora', unitPrice: new Prisma.Decimal('12500.50'), lineTotal: new Prisma.Decimal('22688.41'), position: index }));
const quote = { number: 1042, status: QuoteStatus.SENT, issueDate: new Date('2026-07-01'), validUntil: new Date('2026-07-31'), notes: 'Condiciones: entrega coordinada con el cliente. Los importes se mantienen durante la vigencia indicada.', customer: { name: 'Cliente de demostración con nombre largo', businessName: 'Compañía Ejemplo Argentina SA', email: 'compras@example.com', phone: '+54 341 555-0101', taxId: '30-87654321-0', address: 'Avenida Siempre Viva 1234, Rosario, Santa Fe' }, items, subtotal: new Prisma.Decimal('600024.00'), discountType: DiscountType.PERCENTAGE, discountTotal: new Prisma.Decimal('60002.40'), taxTotal: new Prisma.Decimal('113404.54'), total: new Prisma.Decimal('653426.14') };
async function main() {
  const buffer = await service.generate('sample-user', quote as never);
  const output = resolve(process.cwd(), '..', 'output', 'pdf');
  mkdirSync(output, { recursive: true });
  writeFileSync(resolve(output, 'presupuesto-muestra.pdf'), buffer);
}
void main();
