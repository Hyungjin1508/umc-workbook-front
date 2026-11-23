import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchPage } from "@/screens/movies/search-page";
import { PageLoading } from "@/components/layout/page-loading";

export const metadata: Metadata = { title: "영화 검색" };

export default function Page() {
  return <Suspense fallback={<PageLoading />}><SearchPage /></Suspense>;
}
