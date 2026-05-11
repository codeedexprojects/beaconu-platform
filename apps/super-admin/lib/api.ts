import { toast } from "sonner";
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

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = useAuthStore.getState().token;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  // Session expired
  if (res.status === 401) {
    useAuthStore.getState().clearAuth();
    window.location.href = "/login";
    throw new ApiError(401, "Session expired. Please sign in again.");
  }

  const body = (await res.json()) as ApiResponse<T>;

  if (!res.ok) {
    throw new ApiError(res.status, body.message ?? "Request failed", body);
  }

  return body.data;
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

// Wraps an api call with automatic toast feedback.
// Usage: apiAction(() => api.post('/colleges', data), 'College saved')
export async function apiAction<T>(
  fn: () => Promise<T>,
  successMessage: string,
): Promise<T | null> {
  const toastId = toast.loading("Saving...");
  try {
    const result = await fn();
    toast.success(successMessage, { id: toastId });
    return result;
  } catch (err) {
    const message =
      err instanceof ApiError ? err.message : "Something went wrong";
    toast.error(message, { id: toastId });
    return null;
  }
}
