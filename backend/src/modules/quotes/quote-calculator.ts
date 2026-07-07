import { BadRequestException } from '@nestjs/common';
import { DiscountType, Prisma } from '@prisma/client';

export type CalculationItem = {
  description: string;
  quantity: string;
  unit: string;
  unitPrice: string;
  taxRate: string;
  catalogItemId?: string;
  position: number;
};

const money = (value: Prisma.Decimal) =>
  value.toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);

export function calculateQuote(
  items: CalculationItem[],
  discountType: DiscountType,
  discountValue: string,
) {
  if (!items.length)
    throw new BadRequestException('El presupuesto requiere al menos un ítem');
  const subtotal = money(
    items.reduce(
      (sum, item) =>
        sum.plus(new Prisma.Decimal(item.quantity).mul(item.unitPrice)),
      new Prisma.Decimal(0),
    ),
  );
  const discount = new Prisma.Decimal(discountValue || 0);
  const discountTotal =
    discountType === DiscountType.PERCENTAGE
      ? money(subtotal.mul(discount).div(100))
      : discountType === DiscountType.FIXED
        ? money(discount)
        : new Prisma.Decimal(0);
  if (discountTotal.greaterThan(subtotal))
    throw new BadRequestException(
      'El descuento fijo no puede superar el subtotal',
    );
  let allocated = new Prisma.Decimal(0);
  const calculatedItems = items.map((item, index) => {
    const lineSubtotal = money(
      new Prisma.Decimal(item.quantity).mul(item.unitPrice),
    );
    const lineDiscount =
      index === items.length - 1
        ? discountTotal.minus(allocated)
        : subtotal.isZero()
          ? new Prisma.Decimal(0)
          : money(discountTotal.mul(lineSubtotal).div(subtotal));
    allocated = allocated.plus(lineDiscount);
    const lineTax = money(
      lineSubtotal.minus(lineDiscount).mul(item.taxRate).div(100),
    );
    return {
      ...item,
      quantity: new Prisma.Decimal(item.quantity),
      unitPrice: new Prisma.Decimal(item.unitPrice),
      taxRate: new Prisma.Decimal(item.taxRate),
      lineSubtotal,
      lineTax,
      lineTotal: money(lineSubtotal.minus(lineDiscount).plus(lineTax)),
    };
  });
  const taxTotal = money(
    calculatedItems.reduce(
      (sum, item) => sum.plus(item.lineTax),
      new Prisma.Decimal(0),
    ),
  );
  return {
    items: calculatedItems,
    subtotal,
    discountTotal: money(discountTotal),
    taxTotal,
    total: money(subtotal.minus(discountTotal).plus(taxTotal)),
  };
}
