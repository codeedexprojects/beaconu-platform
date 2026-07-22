import { ApiError } from "@/lib/api";
import { API_BASE_URL } from "@/lib/constants";
import type { StudentUser } from "@/store";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Direct fetch — bypass the api client so that 401 responses (wrong OTP)
// don't trigger the session-expired redirect.

export async function sendStudentOtp(
  phoneNumber: string,
  phoneCountryCode: string = "+91",
): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/v1/student/auth/send-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      phone_number: phoneNumber,
      phone_country_code: phoneCountryCode,
    }),
  });
  const body = (await res.json()) as ApiResponse<null>;
  if (!res.ok) {
    throw new ApiError(res.status, body.message ?? "Failed to send OTP");
  }
}

export async function verifyStudentOtp(
  phoneNumber: string,
  phoneCountryCode: string,
  otp: string,
): Promise<
  | { isNewUser: false; user: StudentUser; accessToken: string }
  | { isNewUser: true; registrationToken: string }
> {
  const res = await fetch(`${API_BASE_URL}/api/v1/student/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      phone_number: phoneNumber,
      phone_country_code: phoneCountryCode,
      otp,
    }),
  });
  const body = (await res.json()) as ApiResponse<{
    isNewUser: boolean;
    user?: StudentUser;
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
}): Promise<{ user: StudentUser; accessToken: string }> {
  const res = await fetch(`${API_BASE_URL}/api/v1/student/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  const body = (await res.json()) as ApiResponse<{
    user: StudentUser;
    accessToken: string;
  }>;
  if (!res.ok) {
    throw new ApiError(res.status, body.message ?? "Registration failed");
  }
  return { user: body.data.user, accessToken: body.data.accessToken };
}

export async function logoutStudent(accessToken: string): Promise<void> {
  await fetch(`${API_BASE_URL}/api/v1/student/auth/logout`, {
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
