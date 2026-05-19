import { API_BASE_URL, COLLEGE_ADMIN_TOKEN_KEY } from "./constants";
import { getCollegeSlugFromLocation, getPortalPath } from "./portal-path";
import { useAuthStore } from "@/store";

interface RequestOptions extends RequestInit {
  data?: unknown;
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
        localStorage.removeItem(COLLEGE_ADMIN_TOKEN_KEY);
        const collegeSlug =
          useAuthStore.getState().user?.collegeSlug ??
          getCollegeSlugFromLocation(
            window.location.pathname,
            window.location.host,
          );
        window.location.href = getPortalPath(collegeSlug, "/login");
      }
    }

    let result;
    try {
      result = await response.json();
    } catch {
      result = null;
    }

    if (!response.ok) {
      throw new Error(result?.message || "Something went wrong");
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
  if (error instanceof Error) return error.message;
  return String(error);
}
