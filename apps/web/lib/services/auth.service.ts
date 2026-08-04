import { ApiError } from "@/lib/api";
import { API_BASE } from "@/lib/constants";
import type { BlogAuthor } from "@/store";

interface AuthApiResponse {
  success: boolean;
  message: string;
  data: {
    user: { id: string; fullName: string; email: string; userType: string };
    accessToken: string;
  };
}

export async function loginBlogAuthor(payload: {
  email: string;
  password: string;
}): Promise<{ user: BlogAuthor; token: string }> {
  const res = await fetch(`${API_BASE}/api/v1/blog/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const body = (await res.json()) as AuthApiResponse;

  if (!res.ok) {
    throw new ApiError(res.status, body.message ?? "Login failed");
  }

  return {
    user: {
      id: body.data.user.id,
      fullName: body.data.user.fullName,
      email: body.data.user.email,
      userType: body.data.user.userType ?? "student",
    },
    token: body.data.accessToken,
  };
}

export async function registerBlogAuthor(payload: {
  full_name: string;
  email: string;
  password: string;
  confirm_password: string;
  bio?: string;
}): Promise<{ user: BlogAuthor; token: string }> {
  const res = await fetch(`${API_BASE}/api/v1/blog/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const body = (await res.json()) as AuthApiResponse;

  if (!res.ok) {
    throw new ApiError(res.status, body.message ?? "Registration failed");
  }

  return {
    user: {
      id: body.data.user.id,
      fullName: body.data.user.fullName,
      email: body.data.user.email,
      userType: body.data.user.userType ?? "student",
    },
    token: body.data.accessToken,
  };
}

export async function logoutBlogAuthor(token: string): Promise<void> {
  await fetch(`${API_BASE}/api/v1/blog/auth/logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
  });
}
