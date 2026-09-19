import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ApiError } from "@/lib/api";
import { LoadingState, QueryError } from "@/components/ui/query-state";

describe("query state components", () => {
  it("exposes an accessible loading status", () => {
    render(<LoadingState label="Cargando clientes…" />);

    expect(screen.getByRole("status")).toHaveTextContent("Cargando clientes…");
  });

  it("allows a manual retry and disables it while retrying", () => {
    const retry = vi.fn();

    const { rerender } = render(
      <QueryError
        error={new ApiError("Servidor no disponible", 503)}
        message="No se pudieron cargar los clientes."
        onRetry={retry}
        retrying
      />,
    );

    const retryButton = screen.getByRole("button", { name: /Reintentar/ });
    expect(retryButton).toBeDisabled();

    rerender(
      <QueryError
        error={new ApiError("Servidor no disponible", 503)}
        message="No se pudieron cargar los clientes."
        onRetry={retry}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /Reintentar/ }));

    expect(retry).toHaveBeenCalledTimes(1);
  });
});
