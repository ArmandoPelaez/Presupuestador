import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { api } from "@/lib/api";
import type { Quote } from "@/types/api";
import Page from "./page";

vi.mock("@/lib/api", () => ({
  api: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "quote-1" }),
  useSearchParams: () => new URLSearchParams(),
}));

const quote: Quote = {
  id: "quote-1",
  number: 23,
  status: "DRAFT",
  customerId: "customer-1",
  customer: {
    id: "customer-1",
    name: "Armando Pelaez",
    email: "armando@example.test",
    isActive: true,
  },
  issueDate: "2026-07-07T00:00:00.000Z",
  validUntil: "2026-07-21T00:00:00.000Z",
  discountType: "NONE",
  discountValue: "0",
  subtotal: "15000.00",
  discountTotal: "0",
  taxTotal: "0",
  total: "15000.00",
  notes: "",
  items: [
    {
      id: "item-1",
      description: "Servicio de instalacion",
      quantity: "1",
      unit: "servicio",
      unitPrice: "15000.00",
      taxRate: "0",
      lineSubtotal: "15000.00",
      lineTax: "0",
      lineTotal: "15000.00",
      position: 0,
    },
  ],
  activeShare: {
    publicUrl: "https://presupuestador.test/p/public-token",
    expiresAt: "2026-08-07T00:00:00.000Z",
  },
};

describe("Quote detail share action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api).mockImplementation(async (path) => {
      if (path === "/quotes/quote-1") return quote;
      if (path === "/quotes/quote-1/share/copied") {
        return { ...quote, status: "SENT" };
      }
      throw new Error(`Unexpected API call: ${path}`);
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("comparte solo el link con el compartir nativo", async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: share,
    });

    render(<Page />);

    fireEvent.click(await screen.findByRole("button", { name: /Compartir/ }));

    await waitFor(() =>
      expect(share).toHaveBeenCalledWith({
        title: "Presupuesto #23",
        url: "https://presupuestador.test/p/public-token",
      }),
    );
  });

  it("copia solo el link cuando no hay compartir nativo", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: undefined,
    });
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    render(<Page />);

    fireEvent.click(await screen.findByRole("button", { name: /Compartir/ }));

    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith(
        "https://presupuestador.test/p/public-token",
      ),
    );
  });
});
