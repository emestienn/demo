import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authApi } from "../api/auth.js";
import { getApiErrorMessage } from "../api/client.js";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      status: "idle",

      isAuthenticated: () => Boolean(get().token),

      login: async (email, password) => {
        const data = await authApi.login({ email, password });
        set({ token: data.token, user: data.user });
        return data.user;
      },

      register: async (username, email, password) => {
        const data = await authApi.register({ username, email, password });
        set({ token: data.token, user: data.user });
        return data.user;
      },

      logout: () => set({ token: null, user: null }),

      refreshMe: async () => {
        try {
          const user = await authApi.me();
          set({ user });
          return user;
        } catch (error) {
          if (error?.response?.status === 401) set({ token: null, user: null });
          throw new Error(getApiErrorMessage(error));
        }
      },

      updateLocalUser: (patch) => set((state) => ({ user: { ...state.user, ...patch } })),
    }),
    { name: "dongne-auth", partialize: (state) => ({ token: state.token, user: state.user }) },
  ),
);
