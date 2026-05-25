import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { setBlogTokenCookie, clearBlogTokenCookie } from "@/lib/cookies";

export interface BlogAuthor {
  id: string;
  fullName: string;
  email: string;
  userType: string;
}

interface AuthState {
  user: BlogAuthor | null;
  token: string | null;
  _hasHydrated: boolean;
  setAuth: (user: BlogAuthor, token: string) => void;
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
        setBlogTokenCookie(token);
        set({ user, token });
      },
      clearAuth: () => {
        clearBlogTokenCookie();
        set({ user: null, token: null });
      },
      setHasHydrated: (value) => set({ _hasHydrated: value }),
    }),
    {
      name: "beaconu-blog-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, token: state.token }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          setBlogTokenCookie(state.token);
        }
        state?.setHasHydrated(true);
      },
    },
  ),
);
