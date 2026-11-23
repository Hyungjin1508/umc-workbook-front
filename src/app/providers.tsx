"use client";

import { useEffect, type ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useAuthStore } from "@/stores/auth-store";
import { useBookmarkStore } from "@/stores/bookmark-store";
import { getQueryClient } from "@/utils/query-client";

export function Providers({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();

  useEffect(() => {
    const unsubscribe = useAuthStore.subscribe((state, previous) => {
      if (state.accessToken !== previous.accessToken) {
        queryClient.removeQueries({
          predicate: (query) => ["members", "favorites", "ratings"].includes(String(query.queryKey[0])),
        });
      }
    });
    void useAuthStore.persist.rehydrate();
    void useBookmarkStore.persist.rehydrate();
    return unsubscribe;
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
