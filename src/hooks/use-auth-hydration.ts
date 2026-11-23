"use client";

import { useSyncExternalStore } from "react";
import { useAuthStore } from "@/stores/auth-store";

function subscribe(listener: () => void) {
  const unsubscribeStart = useAuthStore.persist.onHydrate(listener);
  const unsubscribeFinish = useAuthStore.persist.onFinishHydration(listener);
  return () => {
    unsubscribeStart();
    unsubscribeFinish();
  };
}

export function useAuthHydration() {
  return useSyncExternalStore(
    subscribe,
    () => useAuthStore.persist.hasHydrated(),
    () => false,
  );
}
