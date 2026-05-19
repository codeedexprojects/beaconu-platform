import { api } from "../api";
import type { StaffUser } from "@/store";

export interface SetupTokenValidation {
  valid: boolean;
  collegeName: string;
  collegeSlug: string;
  email: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface SetupAccountInput {
  token: string;
  password: string;
}

export interface AuthResponse {
  user: StaffUser;
  token: string;
}

export async function loginCollegeAdmin(
  data: LoginInput,
): Promise<AuthResponse> {
  const res = await api.post<{
    tokens: { accessToken: string };
    user: StaffUser;
  }>("/api/v1/college-admin/auth/login", data);

  return {
    user: res.user,
    token: res.tokens.accessToken,
  };
}

export async function verifyCollegeSetupToken(
  token: string,
): Promise<SetupTokenValidation> {
  return api.get<SetupTokenValidation>(
    `/api/v1/college-admin/auth/verify-setup-token/${token}`,
  );
}

export async function setupCollegeAccount(
  data: SetupAccountInput,
): Promise<AuthResponse> {
  const res = await api.post<{
    tokens: { accessToken: string };
    user: StaffUser;
  }>("/api/v1/college-admin/auth/setup-account", data);

  return {
    user: res.user,
    token: res.tokens.accessToken,
  };
}

export async function logoutCollegeAdmin(): Promise<unknown> {
  return api.post("/api/v1/college-admin/auth/logout");
}
