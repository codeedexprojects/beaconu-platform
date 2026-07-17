import { useAuthStore } from "@/store";
import { API_BASE_URL } from "@/lib/constants";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type ApiErrorDetail = { path?: string; message?: string };

type ApiErrorBody = {
  message?: string;
  error?: {
    details?: ApiErrorDetail[];
  };
};

interface RawApiResponse {
  success: boolean;
  data: unknown;
  message?: string;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = useAuthStore.getState().token;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  const body = (await res.json()) as RawApiResponse;

  if (res.status === 401) {
    useAuthStore.getState().clearAuth();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("auth:session-expired"));
    }
    throw new ApiError(401, "Session expired. Please sign in again.");
  }

  if (!res.ok) {
    throw new ApiError(res.status, body.message ?? "Request failed", body);
  }

  return body.data as T;
}

export const api = {
  get: <T>(path: string, options?: RequestInit) =>
    request<T>(path, { ...options, method: "GET" }),

  post: <T>(path: string, body: unknown, options?: RequestInit) =>
    request<T>(path, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
    }),

  patch: <T>(path: string, body: unknown, options?: RequestInit) =>
    request<T>(path, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  put: <T>(path: string, body: unknown, options?: RequestInit) =>
    request<T>(path, {
      ...options,
      method: "PUT",
      body: JSON.stringify(body),
    }),

  delete: <T>(path: string, options?: RequestInit) =>
    request<T>(path, { ...options, method: "DELETE" }),
};

export function getErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError))
    return "Something went wrong. Please try again.";

  const body = (error.data ?? null) as ApiErrorBody | null;
  const validationMessage = body?.error?.details?.[0]?.message;

  switch (error.status) {
    case 400:
      return validationMessage ?? error.message;
    case 403:
      return "You don't have permission to do this";
    case 404:
      return "Resource not found";
    case 409:
    case 422:
      return error.message;
    default:
      return "Something went wrong. Please try again.";
  }
}
