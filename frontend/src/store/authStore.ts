import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "@/lib/api";
import type { ApiUser } from "@/types/ecommerce";

interface AuthState {
  token: string | null;
  user: ApiUser | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hydrateUser: () => Promise<void>;
  setSession: (payload: { token: string; user: ApiUser }) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isLoading: false,
      error: null,

      setSession: ({ token, user }) => {
        set({ token, user, error: null });
      },

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.login({ email, password });
          set({
            token: response.token,
            user: response.data,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Connexion impossible",
            isLoading: false,
          });
          throw error;
        }
      },

      hydrateUser: async () => {
        const { token } = get();
        if (!token) return;
        try {
          const user = await api.me(token);
          set({ user });
        } catch {
          set({ token: null, user: null });
        }
      },

      logout: async () => {
        const { token } = get();
        if (token) {
          try {
            await api.logout(token);
          } catch {
            // Silent
          }
        }
        set({ token: null, user: null });
      },
    }),
    { name: "auth-storage" }
  )
);
