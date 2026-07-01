import { env } from "@/env";
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: unknown,
  ) {
    super(message);
  }
}
export async function api<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  const response = await fetch(`${env.NEXT_PUBLIC_API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const data = (await response.json().catch(() => null)) as {
    message?: string | string[];
    details?: unknown;
  } | null;
  if (!response.ok)
    throw new ApiError(
      Array.isArray(data?.message)
        ? data.message.join(", ")
        : (data?.message ?? "No se pudo completar la operación"),
      response.status,
      data?.details,
    );
  return data as T;
}
