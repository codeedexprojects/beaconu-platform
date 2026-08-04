import { ApiError } from "@/lib/api";
import type { AdminProfile } from "@beaconu/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface LoginPayload {
  email: string;
  password: string;
}

interface PlatformLoginPayload extends LoginPayload {
  role_slug: string;
}

interface LoginApiResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      fullName: string;
      email: string;
      roleSlug: string;
      permissions: string[];
    };

    accessToken: string;
  };
}

export async function loginAdmin(
  payload: LoginPayload,
): Promise<{ admin: AdminProfile; token: string }> {
  const roleSlug = process.env.NEXT_PUBLIC_PLATFORM_ROLE_SLUG ?? "super_admin";
  const requestPayload: PlatformLoginPayload = {
    ...payload,
    role_slug: roleSlug,
  };

  const res = await fetch(`${API_BASE}/api/v1/admin/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(requestPayload),
  });

  const body = (await res.json()) as LoginApiResponse;

  if (!res.ok) {
    throw new ApiError(res.status, body.message ?? "Login failed");
  }

  return {
    admin: {
      id: body.data.user.id,
      fullName: body.data.user.fullName,
      email: body.data.user.email,
      role: body.data.user.roleSlug,
      permissions: body.data.user.permissions,
    },
    token: body.data.accessToken,
  };
}
