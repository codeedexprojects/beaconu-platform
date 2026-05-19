import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { setAdminTokenCookie, clearAdminTokenCookie } from "@/lib/cookies";
import type { AdminProfile } from "@beaconu/types";

interface AuthState {
  admin: AdminProfile | null;
  token: string | null;
  _hasHydrated: boolean;
  setAuth: (admin: AdminProfile, token: string) => void;
  clearAuth: () => void;
  setHasHydrated: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      admin: null,
      token: null,
      _hasHydrated: false,
      setAuth: (admin, token) => {
        setAdminTokenCookie(token);
        set({ admin, token });
      },
      clearAuth: () => {
        clearAdminTokenCookie();
        set({ admin: null, token: null });
      },
      setHasHydrated: (value) => set({ _hasHydrated: value }),
    }),
    {
      name: "beaconu-admin-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ admin: state.admin, token: state.token }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          setAdminTokenCookie(state.token);
        }
        state?.setHasHydrated(true);
      },
    },
  ),
);
