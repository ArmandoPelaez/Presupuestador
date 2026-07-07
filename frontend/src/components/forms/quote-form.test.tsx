import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { CatalogItem, Customer, Page, Quote } from "@/types/api";
import { api } from "@/lib/api";
import { QuoteForm } from "./quote-form";

vi.mock("@/lib/api", () => ({
  api: vi.fn(),
  ApiError: class ApiError extends Error {},
}));

const customer: Customer = {
  id: "customer-1",
  name: "Cliente prueba",
  isActive: true,
};

const catalogItem: CatalogItem = {
  id: "catalog-1",
  name: "Producto prueba",
  type: "PRODUCT",
  unitPrice: "100.00",
  stock: 10,
  isActive: true,
};

const quote: Quote = {
  id: "quote-1",
  number: 1,
  status: "DRAFT",
  customerId: customer.id,
  customer,
  issueDate: "2026-07-02T00:00:00.000Z",
  validUntil: "2026-07-16T00:00:00.000Z",
  discountType: "NONE",
  discountValue: "0",
  subtotal: "100.00",
  discountTotal: "0",
  taxTotal: "0",
  total: "100.00",
  items: [
    {
      id: "quote-item-1",
      catalogItemId: catalogItem.id,
      description: catalogItem.name,
      quantity: "1",
      unit: "unidad",
      unitPrice: catalogItem.unitPrice,
      taxRate: "0",
      position: 0,
    },
  ],
};

describe("QuoteForm", () => {
  beforeEach(() => {
    vi.mocked(api).mockImplementation(async (path) => {
      if (path.startsWith("/customers")) {
        return {
          items: [customer],
          meta: { page: 1, pageSize: 100, total: 1, totalPages: 1 },
        } as Page<Customer>;
      }
      return {
        items: [catalogItem],
        meta: { page: 1, pageSize: 100, total: 1, totalPages: 1 },
      } as Page<CatalogItem>;
    });
  });

  it("muestra el paso de totales sin guardar al continuar desde ítems", () => {
    render(<QuoteForm quote={quote} />);

    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));
    expect(screen.getByText("Ítems del presupuesto")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));
    expect(screen.getByText("Condiciones y totales")).toBeInTheDocument();

    const writeCalls = vi
      .mocked(api)
      .mock.calls.filter(
        ([, options]) =>
          options?.method === "POST" || options?.method === "PATCH",
      );
    expect(writeCalls).toHaveLength(0);
  });
});
