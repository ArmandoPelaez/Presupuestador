import { BadRequestException } from '@nestjs/common';
import { DiscountType } from '@prisma/client';
import { calculateQuote, type CalculationItem } from './quote-calculator';

const item = (overrides: Partial<CalculationItem> = {}): CalculationItem => ({
  description: 'Servicio',
  quantity: '1',
  unit: 'u',
  unitPrice: '100',
  taxRate: '21',
  position: 0,
  ...overrides,
});

describe('calculateQuote', () => {
  it('calcula impuesto cero', () => {
    const result = calculateQuote(
      [item({ taxRate: '0' })],
      DiscountType.NONE,
      '0',
    );
    expect(result.total.toString()).toBe('100');
    expect(result.taxTotal.toString()).toBe('0');
  });
  it('calcula múltiples tasas', () => {
    const result = calculateQuote(
      [item(), item({ position: 1, unitPrice: '50', taxRate: '10.5' })],
      DiscountType.NONE,
      '0',
    );
    expect(result.taxTotal.toString()).toBe('26.25');
    expect(result.total.toString()).toBe('176.25');
  });
  it('aplica descuento porcentual antes de impuestos', () => {
    const result = calculateQuote([item()], DiscountType.PERCENTAGE, '10');
    expect(result.discountTotal.toString()).toBe('10');
    expect(result.taxTotal.toString()).toBe('18.9');
    expect(result.total.toString()).toBe('108.9');
  });
  it('aplica descuento fijo proporcional', () => {
    const result = calculateQuote(
      [item(), item({ position: 1, unitPrice: '50' })],
      DiscountType.FIXED,
      '30',
    );
    expect(result.discountTotal.toString()).toBe('30');
    expect(result.total.toString()).toBe('145.2');
  });
  it('redondea fracciones a dos decimales', () => {
    const result = calculateQuote(
      [item({ quantity: '1.3333', unitPrice: '10.99' })],
      DiscountType.NONE,
      '0',
    );
    expect(result.subtotal.toString()).toBe('14.65');
    expect(result.total.decimalPlaces()).toBeLessThanOrEqual(2);
  });
  it('rechaza descuento excesivo y lista vacía', () => {
    expect(() => calculateQuote([item()], DiscountType.FIXED, '101')).toThrow(
      BadRequestException,
    );
    expect(() => calculateQuote([], DiscountType.NONE, '0')).toThrow(
      BadRequestException,
    );
  });
});
