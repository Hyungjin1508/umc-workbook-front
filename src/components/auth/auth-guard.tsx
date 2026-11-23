"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { useAuthHydration } from "@/hooks/use-auth-hydration";
import { PageLoading } from "@/components/layout/page-loading";

export function AuthGuard({ children, guestOnly = false }: { children: ReactNode; guestOnly?: boolean }) {
  const router = useRouter();
  const hasHydrated = useAuthHydration();
  const accessToken = useAuthStore((state) => state.accessToken);
  const shouldRedirect = guestOnly ? Boolean(accessToken) : !accessToken;

  useEffect(() => {
    if (hasHydrated && shouldRedirect) router.replace(guestOnly ? "/" : "/login");
  }, [hasHydrated, shouldRedirect, guestOnly, router]);

  if (!hasHydrated || shouldRedirect) return <PageLoading />;
  return children;
}
