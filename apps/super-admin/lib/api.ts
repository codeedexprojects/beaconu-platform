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

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Single in-flight refresh promise so concurrent 401s all wait on the same call.
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

  const body = (await res.json()) as ApiResponse<{ accessToken: string }>;
  const { admin } = useAuthStore.getState();
  if (!admin) throw new ApiError(401, "Session expired. Please sign in again.");
  useAuthStore.getState().setAuth(admin, body.data.accessToken);
}

async function requestWithRetry<T>(
  path: string,
  options: RequestInit,
  retried: boolean,
): Promise<T> {
  const token = useAuthStore.getState().token;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    // Second 401 after a successful refresh means the session is genuinely dead.
    if (retried) {
      useAuthStore.getState().clearAuth();
      window.location.href = "/login";
      throw new ApiError(401, "Session expired. Please sign in again.");
    }

    // First 401 — attempt a token refresh. Multiple concurrent requests share
    // the same promise so only one refresh call hits the network.
    if (!refreshPromise) {
      refreshPromise = tryRefreshToken().finally(() => {
        refreshPromise = null;
      });
    }

    try {
      await refreshPromise;
    } catch {
      useAuthStore.getState().clearAuth();
      window.location.href = "/login";
      throw new ApiError(401, "Session expired. Please sign in again.");
    }

    return requestWithRetry<T>(path, options, true);
  }

  const body = (await res.json()) as ApiResponse<T>;

  if (!res.ok) {
    throw new ApiError(res.status, body.message ?? "Request failed", body);
  }

  return body.data;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  return requestWithRetry<T>(path, options, false);
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
