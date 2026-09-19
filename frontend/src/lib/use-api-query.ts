"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { api, ApiError } from "@/lib/api";

export type QueryStatus = "loading" | "success" | "refreshing" | "error";

export type ApiQueryResult<T> = {
  data?: T;
  error?: ApiError;
  status: QueryStatus;
  isLoading: boolean;
  isRefreshing: boolean;
  isError: boolean;
  retry: () => void;
};

function asApiError(error: unknown) {
  if (error instanceof ApiError) return error;
  return new ApiError(
    "No se pudieron cargar los datos. Intentá nuevamente.",
    0,
    undefined,
    "network",
  );
}

function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError";
}

export function useApiQuery<T>(path: string): ApiQueryResult<T> {
  const [state, setState] = useState<{
    data?: T;
    error?: ApiError;
    status: QueryStatus;
  }>({ status: "loading" });
  const requestId = useRef(0);
  const requestController = useRef<AbortController | undefined>(undefined);
  const mounted = useRef(false);

  const execute = useCallback(() => {
    requestController.current?.abort();

    const controller = new AbortController();
    const currentRequestId = ++requestId.current;
    requestController.current = controller;

    setState((current) => ({
      data: current.data,
      status: current.data === undefined ? "loading" : "refreshing",
    }));

    void api<T>(path, { signal: controller.signal })
      .then((data) => {
        if (
          !mounted.current ||
          requestId.current !== currentRequestId ||
          controller.signal.aborted
        ) {
          return;
        }
        setState({ data, status: "success" });
      })
      .catch((error: unknown) => {
        if (
          isAbortError(error) ||
          !mounted.current ||
          requestId.current !== currentRequestId
        ) {
          return;
        }
        setState((current) => ({
          data: current.data,
          error: asApiError(error),
          status: "error",
        }));
      });
  }, [path]);

  useEffect(() => {
    mounted.current = true;
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) execute();
    });

    return () => {
      cancelled = true;
      mounted.current = false;
      requestController.current?.abort();
      requestController.current = undefined;
    };
  }, [execute]);

  return {
    ...state,
    isLoading: state.status === "loading",
    isRefreshing: state.status === "refreshing",
    isError: state.status === "error",
    retry: execute,
  };
}
