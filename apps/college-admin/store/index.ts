import { create } from "zustand";
import { persist } from "zustand/middleware";
import { COLLEGE_ADMIN_TOKEN_KEY } from "@/lib/constants";

export interface StaffUser {
  id: string;
  email: string;
  fullName: string;
  collegeId: string;
  collegeSlug: string;
  collegeName: string;
  collegeStatus: "pending_setup" | "active" | string;
  roleSlug: string;
}

interface AuthState {
  user: StaffUser | null;
  isAuthenticated: boolean;
  setAuth: (user: StaffUser, token: string) => void;
  updateUser: (data: Partial<StaffUser>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setAuth: (user, token) => {
        localStorage.setItem(COLLEGE_ADMIN_TOKEN_KEY, token);
        set({ user, isAuthenticated: true });
      },
      updateUser: (data) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null,
        })),
      logout: () => {
        localStorage.removeItem(COLLEGE_ADMIN_TOKEN_KEY);
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: "college-admin-auth",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
