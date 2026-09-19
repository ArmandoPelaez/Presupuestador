import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { api, ApiError } from "@/lib/api";
import { useApiQuery } from "@/lib/use-api-query";

vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api")>("@/lib/api");
  return { ...actual, api: vi.fn() };
});

describe("useApiQuery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("permite reintentar manualmente una consulta fallida", async () => {
    vi.mocked(api)
      .mockRejectedValueOnce(new ApiError("Servidor no disponible", 503))
      .mockResolvedValueOnce({ value: "recuperado" });

    const { result } = renderHook(() => useApiQuery<{ value: string }>("/data"));

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
    expect(result.current.error?.retryable).toBe(true);

    act(() => result.current.retry());

    await waitFor(() => expect(result.current.data).toEqual({ value: "recuperado" }));
    expect(result.current.isError).toBe(false);
    expect(api).toHaveBeenCalledTimes(2);
  });

  it("ignora la respuesta de una consulta obsoleta", async () => {
    const resolvers: Array<(value: string) => void> = [];
    vi.mocked(api).mockImplementation(
      () => new Promise((resolve) => resolvers.push(resolve as (value: string) => void)),
    );

    const { result, rerender } = renderHook(
      ({ path }: { path: string }) => useApiQuery<string>(path),
      { initialProps: { path: "/old" } },
    );

    await waitFor(() => expect(api).toHaveBeenCalledTimes(1));
    rerender({ path: "/new" });
    await waitFor(() => expect(api).toHaveBeenCalledTimes(2));

    act(() => resolvers[0]("old response"));
    act(() => resolvers[1]("new response"));

    await waitFor(() => expect(result.current.data).toBe("new response"));
  });
});
