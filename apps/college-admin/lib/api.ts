import { API_BASE_URL, COLLEGE_ADMIN_TOKEN_KEY } from "./constants";
import { getCollegeSlugFromLocation, getPortalPath } from "./portal-path";
import { useAuthStore } from "@/store";

interface RequestOptions extends RequestInit {
  data?: unknown;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

class ApiClient {
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (typeof window !== "undefined") {
      const token = localStorage.getItem(COLLEGE_ADMIN_TOKEN_KEY);
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {},
  ): Promise<T> {
    const { data, ...customConfig } = options;
    const config: RequestInit = {
      ...customConfig,
      headers: {
        ...this.getHeaders(),
        ...customConfig.headers,
      },
    };

    if (data) {
      config.body = JSON.stringify(data);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (response.status === 401) {
      if (typeof window !== "undefined") {
        useAuthStore.getState().logout();
        localStorage.removeItem(COLLEGE_ADMIN_TOKEN_KEY);
        const collegeSlug =
          useAuthStore.getState().user?.collegeSlug ??
          getCollegeSlugFromLocation(
            window.location.pathname,
            window.location.host,
          );
        window.dispatchEvent(
          new CustomEvent("auth:session-expired", {
            detail: { redirectPath: getPortalPath(collegeSlug, "/login") },
          }),
        );
      }

      throw new ApiError(401, "Session expired. Please sign in again.");
    }

    let result;
    try {
      result = await response.json();
    } catch {
      result = null;
    }

    if (!response.ok) {
      throw new ApiError(
        response.status,
        result?.message || "Something went wrong. Please try again.",
      );
    }

    return result.data as T;
  }

  get<T>(endpoint: string, options?: RequestOptions) {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  post<T>(endpoint: string, data?: unknown, options?: RequestOptions) {
    return this.request<T>(endpoint, { ...options, method: "POST", data });
  }

  patch<T>(endpoint: string, data?: unknown, options?: RequestOptions) {
    return this.request<T>(endpoint, { ...options, method: "PATCH", data });
  }

  put<T>(endpoint: string, data?: unknown, options?: RequestOptions) {
    return this.request<T>(endpoint, { ...options, method: "PUT", data });
  }

  delete<T>(endpoint: string, options?: RequestOptions) {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }
}

export const api = new ApiClient();

export function getErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return "Something went wrong. Please try again.";
  }

  switch (error.status) {
    case 401:
      return "Session expired. Please sign in again.";
    case 403:
      return "You don't have permission to do this.";
    case 404:
      return "Resource not found.";
    case 409:
    case 422:
      return error.message;
    default:
      return error.message || "Something went wrong. Please try again.";
  }
}
