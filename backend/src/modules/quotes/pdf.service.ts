import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { UsersService } from '../users/users.service';
type PdfQuote = Awaited<
  ReturnType<import('./quotes.service').QuotesService['get']>
>;
@Injectable()
export class PdfService {
  constructor(private readonly users: UsersService) {}
  async generate(userId: string, quote: PdfQuote): Promise<Buffer> {
    const owner = await this.users.findPublicById(userId);
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 48,
        bufferPages: true,
      });
      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
      doc
        .fontSize(22)
        .text(owner?.businessName || owner?.name || 'Presupuesto Simple');
      doc
        .fontSize(10)
        .text(owner?.taxId ? `CUIT: ${owner.taxId}` : (owner?.email ?? ''));
      doc.moveDown().fontSize(18).text(`Presupuesto #${quote.number}`);
      doc
        .fontSize(10)
        .text(
          `Estado: ${quote.status} | Emisión: ${quote.issueDate.toLocaleDateString('es-AR')} | Vigencia: ${quote.validUntil?.toLocaleDateString('es-AR') ?? '-'}`,
        );
      doc.moveDown().fontSize(13).text('Cliente');
      doc
        .fontSize(10)
        .text(quote.customer.name)
        .text(quote.customer.businessName ?? '')
        .text(
          [quote.customer.email, quote.customer.phone, quote.customer.taxId]
            .filter(Boolean)
            .join(' | '),
        )
        .text(quote.customer.address ?? '');
      doc.moveDown();
      this.header(doc);
      for (const item of quote.items) {
        if (doc.y > 700) {
          doc.addPage();
          this.header(doc);
        }
        const y = doc.y;
        doc.fontSize(9).text(item.description, 48, y, { width: 220 });
        doc.text(`${item.quantity.toString()} ${item.unit}`, 275, y, {
          width: 70,
          align: 'right',
        });
        doc.text(`$ ${item.unitPrice.toString()}`, 350, y, {
          width: 85,
          align: 'right',
        });
        doc.text(`$ ${item.lineTotal.toString()}`, 440, y, {
          width: 105,
          align: 'right',
        });
        doc.y = Math.max(doc.y, y + 30);
        doc
          .moveTo(48, doc.y)
          .lineTo(547, doc.y)
          .strokeColor('#e5e7eb')
          .stroke();
        doc.moveDown(0.4);
      }
      doc.moveDown();
      this.total(doc, 'Subtotal', quote.subtotal.toString());
      this.total(doc, 'Descuento', quote.discountTotal.toString());
      this.total(doc, 'Impuestos', quote.taxTotal.toString());
      doc.fontSize(14);
      this.total(doc, 'TOTAL', quote.total.toString());
      if (quote.notes) {
        doc.moveDown().fontSize(12).text('Notas');
        doc.fontSize(9).text(quote.notes);
      }
      const range = doc.bufferedPageRange();
      for (let i = 0; i < range.count; i++) {
        doc.switchToPage(i);
        doc.fontSize(8).text(`Página ${i + 1} de ${range.count}`, 48, 800, {
          width: 499,
          align: 'center',
        });
      }
      doc.end();
    });
  }
  private header(doc: PDFKit.PDFDocument) {
    const y = doc.y;
    doc
      .fontSize(9)
      .text('Descripción', 48, y, { width: 220 })
      .text('Cantidad', 275, y, { width: 70, align: 'right' })
      .text('Precio', 350, y, { width: 85, align: 'right' })
      .text('Total', 440, y, { width: 105, align: 'right' });
    doc.y = y + 20;
  }
  private total(doc: PDFKit.PDFDocument, label: string, value: string) {
    const y = doc.y;
    doc.text(label, 350, y, { width: 85, align: 'right' });
    doc.text(`$ ${value}`, 440, y, { width: 105, align: 'right' });
    doc.y = y + 18;
  }
}
