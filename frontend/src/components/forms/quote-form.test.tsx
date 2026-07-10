import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { AiQuoteDraft, CatalogItem, Customer, Page, Quote } from "@/types/api";
import { api } from "@/lib/api";
import { generateAiQuoteDraft } from "@/lib/ai-quote-drafts";
import { QuoteForm } from "./quote-form";

vi.mock("@/lib/api", () => ({
  api: vi.fn(),
  ApiError: class ApiError extends Error {},
}));

vi.mock("@/lib/ai-quote-drafts", () => ({
  generateAiQuoteDraft: vi.fn(),
}));

class MockSpeechRecognition extends EventTarget implements SpeechRecognition {
  static lastInstance: MockSpeechRecognition | null = null;

  continuous = false;
  interimResults = false;
  lang = "";
  maxAlternatives = 1;
  onaudioend = null;
  onaudiostart = null;
  onend: ((this: SpeechRecognition, ev: Event) => unknown) | null = null;
  onerror:
    | ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => unknown)
    | null = null;
  onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => unknown)
    | null = null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => unknown)
    | null = null;
  onsoundend = null;
  onsoundstart = null;
  onspeechend = null;
  onspeechstart = null;
  onstart: ((this: SpeechRecognition, ev: Event) => unknown) | null = null;
  abort = vi.fn();
  start = vi.fn(() => {
    this.onstart?.call(this, new Event("start"));
  });
  stop = vi.fn();

  constructor() {
    super();
    MockSpeechRecognition.lastInstance = this;
  }

  emitResult(transcript: string, isFinal = true) {
    const alternative = { transcript, confidence: 0.9 };
    const result = {
      0: alternative,
      isFinal,
      length: 1,
      item() {
        return alternative;
      },
    } as unknown as SpeechRecognitionResult;
    const event = {
      resultIndex: 0,
      results: {
        0: result,
        length: 1,
        item() {
          return result;
        },
      },
    } as unknown as SpeechRecognitionEvent;
    this.onresult?.call(this, event);
  }

  emitError(error: SpeechRecognitionErrorCode) {
    this.onerror?.call(this, { error } as SpeechRecognitionErrorEvent);
  }

  emitEnd() {
    this.onend?.call(this, new Event("end"));
  }

  emitNoMatch() {
    this.onnomatch?.call(this, {} as SpeechRecognitionEvent);
  }
}

afterEach(() => {
  cleanup();
  MockSpeechRecognition.lastInstance = null;
  document.documentElement.removeAttribute("data-base-ui-scroll-locked");
  document.documentElement.removeAttribute("style");
  document.body.removeAttribute("style");
});

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
    vi.clearAllMocks();
    Object.defineProperty(window, "SpeechRecognition", {
      configurable: true,
      value: undefined,
    });
    Object.defineProperty(window, "webkitSpeechRecognition", {
      configurable: true,
      value: undefined,
    });
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

  it("guarda un borrador IA por el endpoint normal sin aceptar campos autoritativos", async () => {
    const draft: AiQuoteDraft = {
      customerName: customer.name,
      customerMatchId: customer.id,
      items: [
        {
          description: "Producto sugerido por IA",
          quantity: 2,
          unit: "unidad",
          catalogMatchId: catalogItem.id,
        },
        {
          description: "Servicio a medida",
          quantity: 3,
          unit: "hora",
          catalogMatchId: null,
        },
      ],
      notes: "Notas generadas para revisar",
      validUntilDays: 30,
      warnings: ["Revisar el concepto manual."],
    };
    const savedQuote = { ...quote, id: "quote-ai", items: [] };
    vi.mocked(generateAiQuoteDraft).mockResolvedValue(draft);
    vi.mocked(api).mockImplementation(async (path, options) => {
      if (options?.method === "POST" && path === "/quotes") return savedQuote;
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

    render(<QuoteForm initialAiDraftOpen />);

    await waitFor(() =>
      expect(vi.mocked(api)).toHaveBeenCalledWith("/customers?pageSize=100"),
    );
    await waitFor(() =>
      expect(vi.mocked(api)).toHaveBeenCalledWith(
        "/catalog-items?pageSize=100&isActive=true",
      ),
    );
    fireEvent.change(screen.getByLabelText("Descripción del trabajo"), {
      target: { value: "Presupuesto para cliente con producto y servicio" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Generar borrador" }));

    await waitFor(() =>
      expect(screen.getByText("Borrador generado con IA para revisar")).toBeInTheDocument(),
    );
    expect(screen.getByText("Revisar el concepto manual.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));
    await waitFor(() =>
      expect(screen.getByText("Ítems del presupuesto")).toBeInTheDocument(),
    );

    expect(
      screen.getByLabelText(`Coincidencia de catálogo para ${catalogItem.name}`),
    ).toHaveValue(catalogItem.id);
    expect(
      screen.getByLabelText("Coincidencia de catálogo para Servicio a medida"),
    ).toHaveValue("");

    fireEvent.change(screen.getByLabelText("Descripción de Servicio a medida"), {
      target: { value: "Servicio corregido" },
    });
    fireEvent.change(screen.getByLabelText("Precio de Servicio corregido"), {
      target: { value: "50" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));
    await waitFor(() =>
      expect(screen.getByText("Condiciones y totales")).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole("button", { name: "Guardar presupuesto" }));

    await waitFor(() =>
      expect(vi.mocked(api)).toHaveBeenCalledWith(
        "/quotes",
        expect.objectContaining({ method: "POST" }),
      ),
    );

    const createCall = vi
      .mocked(api)
      .mock.calls.find(([path, options]) => path === "/quotes" && options?.method === "POST");
    const payload = JSON.parse(createCall?.[1]?.body as string) as Record<string, unknown>;

    expect(payload).toMatchObject({
      customerId: customer.id,
      discountType: "NONE",
      discountValue: "0",
      notes: draft.notes,
    });
    expect(payload).not.toHaveProperty("number");
    expect(payload).not.toHaveProperty("status");
    expect(payload).not.toHaveProperty("subtotal");
    expect(payload).not.toHaveProperty("taxTotal");
    expect(payload).not.toHaveProperty("total");
    expect(payload.items).toMatchObject([
      {
        catalogItemId: catalogItem.id,
        description: catalogItem.name,
        quantity: "2",
        unit: "unidad",
        unitPrice: catalogItem.unitPrice,
        taxRate: "0",
        position: 0,
      },
      {
        description: "Servicio corregido",
        quantity: "3",
        unit: "hora",
        unitPrice: "50",
        taxRate: "0",
        position: 1,
      },
    ]);
  });

  it("muestra cliente sugerido sin match y permite descartar el borrador IA", async () => {
    vi.mocked(generateAiQuoteDraft).mockResolvedValue({
      customerName: "Cliente nuevo sugerido",
      customerMatchId: null,
      items: [
        {
          description: "Concepto manual",
          quantity: 1,
          unit: "unidad",
          catalogMatchId: null,
        },
      ],
      notes: "",
      validUntilDays: null,
      warnings: [],
    });

    render(<QuoteForm initialAiDraftOpen />);

    await waitFor(() =>
      expect(vi.mocked(api)).toHaveBeenCalledWith("/customers?pageSize=100"),
    );
    fireEvent.change(screen.getByLabelText("Descripción del trabajo"), {
      target: { value: "Presupuesto para cliente nuevo sugerido" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Generar borrador" }));

    await waitFor(() =>
      expect(screen.getByText("Cliente sugerido: Cliente nuevo sugerido")).toBeInTheDocument(),
    );
    expect(
      screen.getByText("Seleccioná un cliente para revisar el borrador generado con IA."),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Descartar" }));
    expect(
      screen.queryByText("Borrador generado con IA para revisar"),
    ).not.toBeInTheDocument();
  });

  it("mantiene Crear con IA escrito cuando el navegador no soporta dictado", async () => {
    const draft: AiQuoteDraft = {
      customerName: customer.name,
      customerMatchId: customer.id,
      items: [
        {
          description: "Servicio desde texto",
          quantity: 1,
          unit: "unidad",
          catalogMatchId: null,
        },
      ],
      notes: "Sin dictado disponible",
      validUntilDays: null,
      warnings: [],
    };
    vi.mocked(generateAiQuoteDraft).mockResolvedValue(draft);

    render(<QuoteForm initialAiDraftOpen />);

    await waitFor(() =>
      expect(vi.mocked(api)).toHaveBeenCalledWith("/customers?pageSize=100"),
    );
    await waitFor(() =>
      expect(vi.mocked(api)).toHaveBeenCalledWith(
        "/catalog-items?pageSize=100&isActive=true",
      ),
    );

    fireEvent.change(await screen.findByLabelText(/Descripci.n del trabajo/), {
      target: { value: "Presupuesto escrito sin soporte de dictado" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Generar borrador" }));

    await waitFor(() =>
      expect(generateAiQuoteDraft).toHaveBeenCalledWith(
        "Presupuesto escrito sin soporte de dictado",
      ),
    );
    expect(
      await screen.findByText("Borrador generado con IA para revisar"),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Iniciar dictado" }),
    ).not.toBeInTheDocument();
  });

  it("permite iniciar y detener dictado sin bloquear el texto escrito", async () => {
    Object.defineProperty(window, "SpeechRecognition", {
      configurable: true,
      value: MockSpeechRecognition,
    });

    render(<QuoteForm initialAiDraftOpen />);

    await waitFor(() =>
      expect(vi.mocked(api)).toHaveBeenCalledWith("/customers?pageSize=100"),
    );

    const description = await screen.findByLabelText(
      /Descripci.n del trabajo/,
    );
    fireEvent.change(description, {
      target: { value: "Texto escrito antes de dictar" },
    });

    fireEvent.click(
      await screen.findByRole("button", { name: "Mantener dictado activo" }),
    );

    expect(MockSpeechRecognition.lastInstance?.lang).toBe("es-AR");
    expect(MockSpeechRecognition.lastInstance?.continuous).toBe(true);
    expect(MockSpeechRecognition.lastInstance?.interimResults).toBe(true);
    expect(MockSpeechRecognition.lastInstance?.start).toHaveBeenCalled();
    expect(screen.getByRole("status")).toHaveTextContent("Escuchando dictado...");
    expect(description).toHaveValue("Texto escrito antes de dictar");
    expect(description).not.toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "Detener dictado" }));

    expect(MockSpeechRecognition.lastInstance?.stop).toHaveBeenCalled();
    expect(screen.getByRole("status")).toHaveTextContent("Deteniendo dictado...");
  });

  it("agrega la transcripcion final al texto revisable y reutiliza el borrador IA existente", async () => {
    Object.defineProperty(window, "SpeechRecognition", {
      configurable: true,
      value: MockSpeechRecognition,
    });
    vi.mocked(generateAiQuoteDraft).mockResolvedValue({
      customerName: customer.name,
      customerMatchId: customer.id,
      items: [
        {
          description: "Producto dictado",
          quantity: 1,
          unit: "unidad",
          catalogMatchId: catalogItem.id,
        },
      ],
      notes: "Generado desde texto dictado revisado",
      validUntilDays: 14,
      warnings: ["Revisar cantidades antes de guardar."],
    });

    render(<QuoteForm initialAiDraftOpen />);

    await waitFor(() =>
      expect(vi.mocked(api)).toHaveBeenCalledWith("/customers?pageSize=100"),
    );
    await waitFor(() =>
      expect(vi.mocked(api)).toHaveBeenCalledWith(
        "/catalog-items?pageSize=100&isActive=true",
      ),
    );

    const description = await screen.findByLabelText(
      /Descripci.n del trabajo/,
    );
    fireEvent.change(description, {
      target: { value: "Presupuesto inicial" },
    });

    fireEvent.click(
      await screen.findByRole("button", { name: "Mantener dictado activo" }),
    );
    MockSpeechRecognition.lastInstance?.emitResult("sumar instalacion final");

    await waitFor(() =>
      expect(description).toHaveValue(
        "Presupuesto inicial sumar instalacion final",
      ),
    );

    fireEvent.click(screen.getByRole("button", { name: "Generar borrador" }));

    await waitFor(() =>
      expect(generateAiQuoteDraft).toHaveBeenCalledWith(
        "Presupuesto inicial sumar instalacion final",
      ),
    );
    expect(
      await screen.findByText("Borrador generado con IA para revisar"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Revisar cantidades antes de guardar."),
    ).toBeInTheDocument();

    const writeCalls = vi
      .mocked(api)
      .mock.calls.filter(
        ([, options]) =>
          options?.method === "POST" || options?.method === "PATCH",
      );
    expect(writeCalls).toHaveLength(0);
  });

  it("recorta la transcripcion dictada con el mismo limite de descripcion", async () => {
    Object.defineProperty(window, "SpeechRecognition", {
      configurable: true,
      value: MockSpeechRecognition,
    });

    render(<QuoteForm initialAiDraftOpen />);

    const description = await screen.findByLabelText(
      /Descripci.n del trabajo/,
    );
    fireEvent.change(description, {
      target: { value: "x".repeat(1998) },
    });

    fireEvent.click(
      await screen.findByRole("button", { name: "Mantener dictado activo" }),
    );
    MockSpeechRecognition.lastInstance?.emitResult("texto excedente");

    await waitFor(() =>
      expect(description).toHaveValue("x".repeat(1998) + " t"),
    );
    expect(screen.getByText("2000/2000")).toBeInTheDocument();
  });

  it("muestra texto provisional sin insertarlo hasta que el navegador lo confirma", async () => {
    Object.defineProperty(window, "SpeechRecognition", {
      configurable: true,
      value: MockSpeechRecognition,
    });

    render(<QuoteForm initialAiDraftOpen />);

    const description = await screen.findByLabelText(
      /Descripci.n del trabajo/,
    );
    fireEvent.change(description, {
      target: { value: "Base escrita" },
    });

    fireEvent.click(
      await screen.findByRole("button", { name: "Mantener dictado activo" }),
    );
    MockSpeechRecognition.lastInstance?.emitResult("texto en curso", false);

    expect(await screen.findByText("Texto provisional")).toBeInTheDocument();
    expect(screen.getByText("texto en curso")).toBeInTheDocument();
    expect(description).toHaveValue("Base escrita");

    MockSpeechRecognition.lastInstance?.emitResult("texto final");

    await waitFor(() =>
      expect(description).toHaveValue("Base escrita texto final"),
    );
  });

  it("muestra error de permiso recuperable y conserva el texto escrito", async () => {
    Object.defineProperty(window, "SpeechRecognition", {
      configurable: true,
      value: MockSpeechRecognition,
    });

    render(<QuoteForm initialAiDraftOpen />);

    const description = await screen.findByLabelText(
      /Descripci.n del trabajo/,
    );
    fireEvent.change(description, {
      target: { value: "Texto que no se debe borrar" },
    });

    fireEvent.click(
      await screen.findByRole("button", { name: "Mantener dictado activo" }),
    );
    MockSpeechRecognition.lastInstance?.emitError("not-allowed");

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "No se pudo acceder al microfono.",
    );
    expect(description).toHaveValue("Texto que no se debe borrar");
  });

  it("muestra no-match recuperable sin guardar ni borrar la descripcion", async () => {
    Object.defineProperty(window, "SpeechRecognition", {
      configurable: true,
      value: MockSpeechRecognition,
    });

    render(<QuoteForm initialAiDraftOpen />);

    const description = await screen.findByLabelText(
      /Descripci.n del trabajo/,
    );
    fireEvent.change(description, {
      target: { value: "Texto previo al no match" },
    });

    fireEvent.click(
      await screen.findByRole("button", { name: "Mantener dictado activo" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Detener dictado" }));
    MockSpeechRecognition.lastInstance?.emitNoMatch();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "No se reconocio voz en esta sesion.",
    );
    expect(description).toHaveValue("Texto previo al no match");
    const writeCalls = vi
      .mocked(api)
      .mock.calls.filter(
        ([, options]) =>
          options?.method === "POST" || options?.method === "PATCH",
      );
    expect(writeCalls).toHaveLength(0);
  });
});
