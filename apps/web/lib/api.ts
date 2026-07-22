import { useAuthStore, useStudentAuthStore } from "@/store";
import { API_BASE } from "./constants";

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

type Identity = "student" | "blog-author";

function identityFor(path: string): Identity {
  // Public college listing/detail routes accept an optional student Bearer
  // token to personalize the response (isWishlisted) — attach it when present,
  // but the routes never 401 on a missing/invalid token, so this is safe even
  // for logged-out visitors.
  if (
    path.startsWith("/api/v1/student") ||
    path.startsWith("/api/v1/public/colleges")
  ) {
    return "student";
  }
  return "blog-author";
}

function getToken(identity: Identity): string | null {
  return identity === "student"
    ? useStudentAuthStore.getState().token
    : useAuthStore.getState().token;
}

function clearAuth(identity: Identity): void {
  if (identity === "student") {
    useStudentAuthStore.getState().clearAuth();
  } else {
    useAuthStore.getState().clearAuth();
  }
}

const refreshPromises: Record<Identity, Promise<void> | null> = {
  student: null,
  "blog-author": null,
};

async function tryRefreshToken(identity: Identity): Promise<void> {
  if (identity === "student") {
    const res = await fetch(`${API_BASE}/api/v1/student/auth/refresh-token`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) {
      throw new ApiError(401, "Session expired. Please sign in again.");
    }
    const body = (await res.json()) as ApiResponse<{ accessToken: string }>;
    const { user } = useStudentAuthStore.getState();
    if (!user) {
      throw new ApiError(401, "Session expired. Please sign in again.");
    }
    useStudentAuthStore.getState().setAuth(user, body.data.accessToken);
    return;
  }

  const res = await fetch(`${API_BASE}/api/v1/blog/auth/refresh`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    throw new ApiError(401, "Session expired. Please sign in again.");
  }

  const body = (await res.json()) as ApiResponse<{ accessToken: string }>;
  const { user } = useAuthStore.getState();
  if (!user) throw new ApiError(401, "Session expired. Please sign in again.");
  useAuthStore.getState().setAuth(user, body.data.accessToken);
}

async function requestWithRetry<T>(
  path: string,
  options: RequestInit,
  retried: boolean,
): Promise<T> {
  const identity = identityFor(path);
  const token = getToken(identity);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    if (retried) {
      clearAuth(identity);
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("auth:session-expired", { detail: { identity } }),
        );
      }
      throw new ApiError(401, "Session expired. Please sign in again.");
    }

    if (!refreshPromises[identity]) {
      refreshPromises[identity] = tryRefreshToken(identity).finally(() => {
        refreshPromises[identity] = null;
      });
    }

    try {
      await refreshPromises[identity];
    } catch {
      clearAuth(identity);
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("auth:session-expired", { detail: { identity } }),
        );
      }
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
