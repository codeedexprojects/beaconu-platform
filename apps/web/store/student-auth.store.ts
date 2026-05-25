import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { setStudentTokenCookie, clearStudentTokenCookie } from "@/lib/cookies";

export interface Student {
  id: string;
  fullName: string;
  email: string | null;
  avatarUrl: string | null;
}

interface StudentAuthState {
  user: Student | null;
  token: string | null;
  _hasHydrated: boolean;
  setAuth: (user: Student, token: string) => void;
  clearAuth: () => void;
  setHasHydrated: (value: boolean) => void;
}

export const useStudentAuthStore = create<StudentAuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      _hasHydrated: false,
      setAuth: (user, token) => {
        setStudentTokenCookie(token);
        set({ user, token });
      },
      clearAuth: () => {
        clearStudentTokenCookie();
        set({ user: null, token: null });
      },
      setHasHydrated: (value) => set({ _hasHydrated: value }),
    }),
    {
      name: "beaconu-student-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, token: state.token }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          setStudentTokenCookie(state.token);
        }
        state?.setHasHydrated(true);
      },
    },
  ),
);
