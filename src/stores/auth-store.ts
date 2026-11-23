import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { clientStorage } from "@/utils/client-storage";

interface AuthStore {
  accessToken: string | null;
  setAccessToken: (accessToken: string | null) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      accessToken: null,
      setAccessToken: (accessToken) => set({ accessToken }),
    }),
    {
      name: "umcine-auth-store",
      storage: createJSONStorage(() => clientStorage),
      skipHydration: true,
      partialize: (state) => ({ accessToken: state.accessToken }),
    },
  ),
);
