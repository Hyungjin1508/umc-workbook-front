import type { Metadata } from "next";
import { LoginPage } from "@/screens/auth/login-page";
import { AuthGuard } from "@/components/auth/auth-guard";

export const metadata: Metadata = { title: "로그인" };

export default function Page() {
  return <AuthGuard guestOnly><LoginPage /></AuthGuard>;
}
