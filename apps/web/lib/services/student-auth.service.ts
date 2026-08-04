import { ApiError } from "@/lib/api";
import { API_BASE } from "@/lib/constants";
import type { Student } from "@/store";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export async function sendStudentOtp(
  phone_number: string,
  phone_country_code: string = "+91",
): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/student/auth/send-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone_number, phone_country_code }),
  });
  const body = (await res.json()) as ApiResponse<null>;
  if (!res.ok) {
    throw new ApiError(res.status, body.message ?? "Failed to send OTP");
  }
}

export async function verifyStudentOtp(
  phone_number: string,
  phone_country_code: string,
  otp: string,
): Promise<
  | { isNewUser: false; user: Student; accessToken: string }
  | { isNewUser: true; registrationToken: string }
> {
  const res = await fetch(`${API_BASE}/api/v1/student/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ phone_number, phone_country_code, otp }),
  });
  const body = (await res.json()) as ApiResponse<{
    isNewUser: boolean;
    user?: Student;
    accessToken?: string;
    registrationToken?: string;
  }>;
  if (!res.ok) {
    throw new ApiError(res.status, body.message ?? "OTP verification failed");
  }
  if (!body.data.isNewUser) {
    return {
      isNewUser: false,
      user: body.data.user!,
      accessToken: body.data.accessToken!,
    };
  }
  return { isNewUser: true, registrationToken: body.data.registrationToken! };
}

export async function registerStudent(payload: {
  full_name: string;
  email?: string;
  phone_number: string;
  phone_country_code: string;
  registration_token: string;
}): Promise<{ user: Student; accessToken: string }> {
  const res = await fetch(`${API_BASE}/api/v1/student/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  const body = (await res.json()) as ApiResponse<{
    user: Student;
    accessToken: string;
  }>;
  if (!res.ok) {
    throw new ApiError(res.status, body.message ?? "Registration failed");
  }
  return { user: body.data.user, accessToken: body.data.accessToken };
}

export async function logoutStudent(accessToken: string): Promise<void> {
  await fetch(`${API_BASE}/api/v1/student/auth/logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    credentials: "include",
  }).catch(() => {
    // best-effort
  });
}
