import { useAuthStore } from "@/store";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

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

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
}

export interface Paginated<T> {
  data: T[];
  meta: PaginationMeta;
}

interface RawApiResponse {
  success: boolean;
  data: unknown;
  meta?: PaginationMeta;
  message?: string;
}

let refreshPromise: Promise<void> | null = null;

async function tryRefreshToken(): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/admin/auth/refresh-token`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    throw new ApiError(401, "Session expired. Please sign in again.");
  }

  const body = (await res.json()) as { data: { accessToken: string } };
  const { admin } = useAuthStore.getState();
  if (!admin) throw new ApiError(401, "Session expired. Please sign in again.");
  useAuthStore.getState().setAuth(admin, body.data.accessToken);
}

async function handleUnauthorized(): Promise<void> {
  if (!refreshPromise) {
    refreshPromise = tryRefreshToken().finally(() => {
      refreshPromise = null;
    });
  }
  try {
    await refreshPromise;
  } catch {
    useAuthStore.getState().clearAuth();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("auth:session-expired"));
    }
    throw new ApiError(401, "Session expired. Please sign in again.");
  }
}

async function executeRequest(
  path: string,
  options: RequestInit,
): Promise<RawApiResponse> {
  const token = useAuthStore.getState().token;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const body = (await res.json()) as RawApiResponse;

  if (!res.ok) {
    throw new ApiError(res.status, body.message ?? "Request failed", body);
  }

  return body;
}

async function requestWithRetry<T>(
  path: string,
  options: RequestInit,
  retried: boolean,
): Promise<T> {
  try {
    const body = await executeRequest(path, options);
    return body.data as T;
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      if (retried) {
        useAuthStore.getState().clearAuth();
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("auth:session-expired"));
        }
        throw err;
      }
      await handleUnauthorized();
      return requestWithRetry<T>(path, options, true);
    }
    throw err;
  }
}

async function requestPaginatedWithRetry<T>(
  path: string,
  options: RequestInit,
  retried: boolean,
): Promise<Paginated<T>> {
  try {
    const body = await executeRequest(path, options);
    return {
      data: (body.data as T[]) ?? [],
      meta: body.meta ?? { total: 0, page: 1, limit: 10, hasNext: false },
    };
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      if (retried) {
        useAuthStore.getState().clearAuth();
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("auth:session-expired"));
        }
        throw err;
      }
      await handleUnauthorized();
      return requestPaginatedWithRetry<T>(path, options, true);
    }
    throw err;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  return requestWithRetry<T>(path, options, false);
}

async function requestPaginated<T>(
  path: string,
  options: RequestInit = {},
): Promise<Paginated<T>> {
  return requestPaginatedWithRetry<T>(path, options, false);
}

export const api = {
  get: <T>(path: string, options?: RequestInit) =>
    request<T>(path, { ...options, method: "GET" }),

  getPaginated: <T>(path: string, options?: RequestInit) =>
    requestPaginated<T>(path, { ...options, method: "GET" }),

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
  switch (error.status) {
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
