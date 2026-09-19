import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { api } from "@/lib/api";
import { CatalogList } from "@/components/catalog/catalog-list";
import { CustomerList } from "@/components/customers/customer-list";
import { QuoteList } from "@/components/quotes/quote-list";

vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api")>("@/lib/api");
  return { ...actual, api: vi.fn() };
});

const emptyPage = {
  items: [],
  meta: { page: 1, pageSize: 10, total: 20, totalPages: 2 },
};

async function flushEffects() {
  await act(async () => {
    await Promise.resolve();
  });
}

const listCases = [
  {
    name: "clientes",
    render: () => <CustomerList />,
    input: () => screen.getByRole("textbox", { name: "Buscar clientes" }),
    expectedPath: "/customers?page=1&pageSize=10&search=Acme",
  },
  {
    name: "catálogo",
    render: () => <CatalogList />,
    input: () => screen.getByPlaceholderText("Buscar productos o servicios"),
    expectedPath: "/catalog-items?page=1&pageSize=10&search=Acme",
  },
  {
    name: "presupuestos",
    render: () => <QuoteList />,
    input: () => screen.getByPlaceholderText("Buscar cliente o notas"),
    expectedPath: "/quotes?page=1&pageSize=10&search=Acme",
  },
] as const;

describe("búsquedas remotas con debounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.mocked(api).mockResolvedValue(emptyPage);
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it.each(listCases)(
    "carga inicialmente $name sin esperar el debounce",
    async ({ render: renderList, expectedPath }) => {
      render(renderList());

      await flushEffects();

      expect(api).toHaveBeenCalledWith(
        expectedPath.replace("search=Acme", "search="),
        expect.objectContaining({ signal: expect.any(AbortSignal) }),
      );
    },
  );

  it.each(listCases)(
    "consulta una sola vez el último valor en $name",
    async ({ render: renderList, input, expectedPath }) => {
      render(renderList());
      await flushEffects();
      vi.mocked(api).mockClear();

      fireEvent.change(input(), { target: { value: "A" } });
      fireEvent.change(input(), { target: { value: "Acme" } });
      expect(api).not.toHaveBeenCalled();

      await act(async () => {
        vi.advanceTimersByTime(349);
        await Promise.resolve();
      });
      expect(api).not.toHaveBeenCalled();

      await act(async () => {
        vi.advanceTimersByTime(1);
        await Promise.resolve();
      });

      expect(api).toHaveBeenCalledTimes(1);
      expect(api).toHaveBeenCalledWith(
        expectedPath,
        expect.objectContaining({ signal: expect.any(AbortSignal) }),
      );
    },
  );

  it("aplica una nueva búsqueda desde la página uno sin request intermedia", async () => {
    render(<QuoteList />);
    await flushEffects();

    fireEvent.click(screen.getByRole("button", { name: "Siguiente" }));
    await flushEffects();
    expect(api).toHaveBeenLastCalledWith(
      "/quotes?page=2&pageSize=10&search=",
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );

    vi.mocked(api).mockClear();
    fireEvent.change(screen.getByPlaceholderText("Buscar cliente o notas"), {
      target: { value: "Acme" },
    });
    expect(api).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(350);
      await Promise.resolve();
    });

    expect(api).toHaveBeenCalledTimes(1);
    expect(api).toHaveBeenCalledWith(
      "/quotes?page=1&pageSize=10&search=Acme",
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it("espera el debounce al limpiar una búsqueda aunque la respuesta sea inmediata", async () => {
    render(<QuoteList />);
    await flushEffects();

    const input = screen.getByPlaceholderText("Buscar cliente o notas");
    fireEvent.change(input, { target: { value: "Acme" } });
    await act(async () => {
      vi.advanceTimersByTime(350);
      await Promise.resolve();
    });
    vi.mocked(api).mockClear();

    fireEvent.change(input, { target: { value: "" } });
    expect(api).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(349);
      await Promise.resolve();
    });
    expect(api).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(1);
      await Promise.resolve();
    });
    expect(api).toHaveBeenCalledWith(
      "/quotes?page=1&pageSize=10&search=",
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });
});
