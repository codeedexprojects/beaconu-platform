import { api } from "../api";
import type { StaffUser } from "@/store";

export interface SetupTokenValidation {
  valid: boolean;
  collegeName: string;
  collegeSlug: string;
  email: string;
}

export const authService = {
  login: async (data: any) => {
    const res = await api.post<{
      tokens: { accessToken: string };
      user: StaffUser;
    }>("/api/v1/college-admin/auth/login", data);
    return {
      user: res.user,
      token: res.tokens.accessToken,
    };
  },

  verifySetupToken: (token: string) =>
    api.get<SetupTokenValidation>(
      `/api/v1/college-admin/auth/verify-setup-token/${token}`,
    ),

  setupAccount: async (data: any) => {
    const res = await api.post<{
      tokens: { accessToken: string };
      user: StaffUser;
    }>("/api/v1/college-admin/auth/setup-account", data);
    return {
      user: res.user,
      token: res.tokens.accessToken,
    };
  },

  logout: () => api.post("/api/v1/college-admin/auth/logout"),
};
