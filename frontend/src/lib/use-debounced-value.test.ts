import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  SEARCH_DEBOUNCE_MS,
  useDebouncedValue,
} from "@/lib/use-debounced-value";

describe("useDebouncedValue", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("mantiene el valor aplicado hasta que transcurre el debounce", () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) => useDebouncedValue(value),
      { initialProps: { value: "" } },
    );

    rerender({ value: "Acme" });
    expect(result.current).toBe("");

    act(() => vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS - 1));
    expect(result.current).toBe("");

    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe("Acme");
  });

  it("reinicia el temporizador y aplica solamente el último valor", () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) => useDebouncedValue(value),
      { initialProps: { value: "" } },
    );

    rerender({ value: "A" });
    act(() => vi.advanceTimersByTime(200));
    rerender({ value: "Ac" });
    act(() => vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS - 1));
    expect(result.current).toBe("");

    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe("Ac");
  });

  it("permite aplicar el criterio vacío después del mismo retraso", () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) => useDebouncedValue(value),
      { initialProps: { value: "Acme" } },
    );

    rerender({ value: "" });
    expect(result.current).toBe("Acme");

    act(() => vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS));
    expect(result.current).toBe("");
  });

  it("limpia el temporizador al desmontarse", () => {
    const { result, rerender, unmount } = renderHook(
      ({ value }: { value: string }) => useDebouncedValue(value),
      { initialProps: { value: "" } },
    );

    rerender({ value: "Acme" });
    unmount();

    act(() => vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS));
    expect(result.current).toBe("");
  });
});
