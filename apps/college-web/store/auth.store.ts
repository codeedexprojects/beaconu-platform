import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { setCollegeTokenCookie, clearCollegeTokenCookie } from "@/lib/cookies";

interface Student {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  collegeId: string;
  avatarUrl?: string;
}

interface AuthState {
  student: Student | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (student: Student, token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      student: null,
      token: null,
      isAuthenticated: false,
      setAuth: (student, token) => {
        setCollegeTokenCookie(token);
        set({ student, token, isAuthenticated: true });
      },
      clearAuth: () => {
        clearCollegeTokenCookie();
        set({ student: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: "beaconu-college-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ student: state.student, token: state.token }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          setCollegeTokenCookie(state.token);
          state.isAuthenticated = true;
        }
      },
    },
  ),
);
