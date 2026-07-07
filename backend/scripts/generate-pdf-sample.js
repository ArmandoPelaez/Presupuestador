"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const client_1 = require("@prisma/client");
const pdf_service_1 = require("../src/modules/quotes/pdf.service");
const users = { findPublicById: async () => ({ name: 'Estudio Creativo del Litoral', email: 'hola@estudio.example', businessName: 'Estudio Creativo del Litoral', taxId: '30-12345678-9' }) };
const service = new pdf_service_1.PdfService(users);
const items = Array.from({ length: 32 }, (_, index) => ({ description: `Servicio profesional ${index + 1}: descripción extensa para comprobar ajuste de texto y paginación`, quantity: new client_1.Prisma.Decimal('1.5'), unit: 'hora', unitPrice: new client_1.Prisma.Decimal('12500.50'), lineTotal: new client_1.Prisma.Decimal('22688.41'), position: index }));
const quote = { number: 1042, status: client_1.QuoteStatus.SENT, issueDate: new Date('2026-07-01'), validUntil: new Date('2026-07-31'), notes: 'Condiciones: entrega coordinada con el cliente. Los importes se mantienen durante la vigencia indicada.', customer: { name: 'Cliente de demostración con nombre largo', businessName: 'Compañía Ejemplo Argentina SA', email: 'compras@example.com', phone: '+54 341 555-0101', taxId: '30-87654321-0', address: 'Avenida Siempre Viva 1234, Rosario, Santa Fe' }, items, subtotal: new client_1.Prisma.Decimal('600024.00'), discountType: client_1.DiscountType.PERCENTAGE, discountTotal: new client_1.Prisma.Decimal('60002.40'), taxTotal: new client_1.Prisma.Decimal('113404.54'), total: new client_1.Prisma.Decimal('653426.14') };
const buffer = await service.generate('sample-user', quote);
const output = (0, node_path_1.resolve)(process.cwd(), '..', 'output', 'pdf');
(0, node_fs_1.mkdirSync)(output, { recursive: true });
(0, node_fs_1.writeFileSync)((0, node_path_1.resolve)(output, 'presupuesto-muestra.pdf'), buffer);
//# sourceMappingURL=generate-pdf-sample.js.map