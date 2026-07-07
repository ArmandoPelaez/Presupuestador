import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Page, Quote } from "@/types/api";
import { api } from "@/lib/api";
import PageComponent from "./page";

vi.mock("@/lib/api", () => ({
  api: vi.fn(),
}));

const quote: Quote = {
  id: "quote-1",
  number: 1,
  status: "DRAFT",
  customerId: "customer-1",
  customer: { id: "customer-1", name: "Cliente prueba", isActive: true },
  issueDate: "2026-07-05T00:00:00.000Z",
  validUntil: "2026-07-20T00:00:00.000Z",
  discountType: "NONE",
  discountValue: "0",
  subtotal: "100.00",
  discountTotal: "0",
  taxTotal: "0",
  total: "100.00",
  items: [],
};

describe("Dashboard", () => {
  beforeEach(() => {
    vi.mocked(api).mockImplementation(async (path) => {
      if (path === "/dashboard/summary") {
        return {
          counts: { DRAFT: 12, SENT: 1, APPROVED: 0, REJECTED: 0 },
          totals: {},
          totalQuotes: 13,
          customers: 1,
          catalogItems: 1,
          recent: [],
        };
      }

      return {
        items: [quote],
        meta: { page: 1, pageSize: 10, total: 13, totalPages: 2 },
      } as Page<Quote>;
    });
  });

  it("solicita diez presupuestos por página y conserva el filtro", async () => {
    render(<PageComponent />);

    await screen.findByText("Cliente prueba");
    expect(api).toHaveBeenCalledWith("/quotes?page=1&pageSize=10");

    fireEvent.click(screen.getByRole("button", { name: "Siguiente" }));
    await waitFor(() =>
      expect(api).toHaveBeenCalledWith("/quotes?page=2&pageSize=10"),
    );

    fireEvent.click(screen.getByRole("button", { name: /Enviados/ }));
    await waitFor(() =>
      expect(api).toHaveBeenCalledWith(
        "/quotes?page=1&pageSize=10&status=SENT",
      ),
    );
  });
});
