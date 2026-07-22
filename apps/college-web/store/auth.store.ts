import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { setStudentTokenCookie, clearStudentTokenCookie } from "@/lib/cookies";

export interface StudentUser {
  id: string;
  fullName: string;
  email: string | null;
  avatarUrl: string | null;
}

interface AuthState {
  student: StudentUser | null;
  token: string | null;
  _hasHydrated: boolean;
  setAuth: (student: StudentUser, token: string) => void;
  clearAuth: () => void;
  setHasHydrated: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      student: null,
      token: null,
      _hasHydrated: false,
      setAuth: (student, token) => {
        setStudentTokenCookie(token);
        set({ student, token });
      },
      clearAuth: () => {
        clearStudentTokenCookie();
        set({ student: null, token: null });
      },
      setHasHydrated: (value) => set({ _hasHydrated: value }),
    }),
    {
      name: "college-web-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        student: state.student,
        token: state.token,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          setStudentTokenCookie(state.token);
        }
        state?.setHasHydrated(true);
      },
    },
  ),
);
