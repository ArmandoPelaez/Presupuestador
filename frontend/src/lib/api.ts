import { env } from "@/env";

export type ApiErrorKind =
  | "network"
  | "unauthorized"
  | "forbidden"
  | "not-found"
  | "validation"
  | "server"
  | "unknown";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: unknown,
    public kind: ApiErrorKind = getApiErrorKind(status),
  ) {
    super(message);
    this.name = "ApiError";
  }

  get retryable() {
    return this.kind === "network" || this.kind === "server";
  }
}

function getApiErrorKind(status: number): ApiErrorKind {
  if (status === 401) return "unauthorized";
  if (status === 403) return "forbidden";
  if (status === 404) return "not-found";
  if (status === 400 || status === 422) return "validation";
  if (status >= 500) return "server";
  return "unknown";
}

function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError";
}

function getNetworkError(error: unknown) {
  if (isAbortError(error)) return error;
  return new ApiError(
    "No se pudo conectar con el servidor. Intentá nuevamente.",
    0,
    undefined,
    "network",
  );
}

async function fetchJson(url: string, options: RequestInit) {
  try {
    return await fetch(url, options);
  } catch (error) {
    throw getNetworkError(error);
  }
}

function getErrorPayload(response: Response) {
  return response.json().catch(() => null) as Promise<{
    message?: string | string[];
    details?: unknown;
  } | null>;
}

function getErrorMessage(data: { message?: string | string[] } | null) {
  return Array.isArray(data?.message)
    ? data.message.join(", ")
    : (data?.message ?? "No se pudo completar la operación");
}

export async function api<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  const response = await fetchJson(`${env.NEXT_PUBLIC_API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const data = await getErrorPayload(response);
  if (
    response.status === 401 &&
    token &&
    typeof window !== "undefined" &&
    !path.startsWith("/auth/")
  ) {
    localStorage.removeItem("accessToken");
    window.location.replace("/login");
    return new Promise<T>(() => undefined);
  }
  if (!response.ok) {
    throw new ApiError(getErrorMessage(data), response.status, data?.details);
  }
  return data as T;
}

export async function publicApi<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetchJson(`${env.NEXT_PUBLIC_API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  const data = await getErrorPayload(response);
  if (!response.ok) {
    throw new ApiError(getErrorMessage(data), response.status, data?.details);
  }
  return data as T;
}
