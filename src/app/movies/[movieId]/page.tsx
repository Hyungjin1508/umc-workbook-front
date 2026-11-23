import type { Metadata } from "next";
import { Suspense } from "react";
import { MovieDetailPage } from "@/screens/movies/movie-detail-page";
import { PageLoading } from "@/components/layout/page-loading";

export const metadata: Metadata = { title: "영화 상세" };

export default function Page() {
  return <Suspense fallback={<PageLoading />}><MovieDetailPage /></Suspense>;
}
