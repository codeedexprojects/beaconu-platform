import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { COLLEGE_ADMIN_TOKEN_KEY } from "@/lib/constants";
import { setCollegeTokenCookie, clearCollegeTokenCookie } from "@/lib/cookies";

export interface StaffUser {
  id: string;
  email: string;
  fullName: string;
  collegeId: string;
  collegeSlug: string;
  collegeName: string;
  collegeStatus: "pending_setup" | "active" | string;
  roleSlug: string;
  permissions?: string[];
}

interface AuthState {
  user: StaffUser | null;
  token: string | null;
  _hasHydrated: boolean;
  setAuth: (user: StaffUser, token: string) => void;
  updateUser: (data: Partial<StaffUser>) => void;
  clearAuth: () => void;
  setHasHydrated: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      _hasHydrated: false,
      setAuth: (user, token) => {
        localStorage.setItem(COLLEGE_ADMIN_TOKEN_KEY, token);
        setCollegeTokenCookie(token);
        set({ user, token });
      },
      updateUser: (data) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null,
        })),
      clearAuth: () => {
        localStorage.removeItem(COLLEGE_ADMIN_TOKEN_KEY);
        clearCollegeTokenCookie();
        set({ user: null, token: null });
      },
      setHasHydrated: (value) => set({ _hasHydrated: value }),
    }),
    {
      name: "college-admin-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          setCollegeTokenCookie(state.token);
        }
        state?.setHasHydrated(true);
      },
    },
  ),
);
