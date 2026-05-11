import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { setAdminTokenCookie, clearAdminTokenCookie } from "@/lib/cookies";

interface Admin {
  id: string;
  fullName: string;
  email: string;
  role: "super_admin" | "sub_admin";
  avatarUrl?: string;
}

interface AuthState {
  admin: Admin | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (admin: Admin, token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      admin: null,
      token: null,
      isAuthenticated: false,
      setAuth: (admin, token) => {
        setAdminTokenCookie(token);
        set({ admin, token, isAuthenticated: true });
      },
      clearAuth: () => {
        clearAdminTokenCookie();
        set({ admin: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: "beaconu-admin-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ admin: state.admin, token: state.token }),
      onRehydrateStorage: () => (state) => {
        // Re-sync cookie on page reload in case it expired
        if (state?.token) {
          setAdminTokenCookie(state.token);
          state.isAuthenticated = true;
        }
      },
    },
  ),
);
