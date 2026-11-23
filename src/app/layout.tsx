import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import Header from "@/components/layout/header";
import { Providers } from "./providers";
import "../index.css";

export const metadata: Metadata = {
  title: { default: "UMCine", template: "%s | UMCine" },
  description: "영화를 검색하고 즐겨찾기와 평점을 관리하는 UMCine예요.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <Providers>
          <div className="[&_button:focus-visible]:outline-2 [&_button:focus-visible]:outline-[#2563eb] [&_button:focus-visible]:outline-offset-2 [&_a:focus-visible]:outline-2 [&_a:focus-visible]:outline-[#2563eb] [&_a:focus-visible]:outline-offset-2">
            <Suspense fallback={<header className="h-[91px] w-full animate-pulse bg-white" aria-label="메뉴를 불러오는 중이에요." />}>
              <Header />
            </Suspense>
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
