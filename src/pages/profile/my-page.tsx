import { Link } from "@tanstack/react-router";
import { useQueries, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getMovieDetail } from "@/api/movies/get-movie-detail";
import { ProfileAvatar } from "@/components/profile/profile-avatar";
import MovieCard from "@/components/movies/movie-card";
import { TmdbAttribution } from "@/components/layout/tmdb-attribution";
import { useFavoritesQuery } from "@/hooks/use-favorites-query";
import { useMemberId } from "@/hooks/use-member-id";
import { useProfileStore } from "@/stores/profile-store";
import { useAuthStore } from "@/stores/auth-store";
import { getMe } from "@/api/members/me";

export function MyPage() {
  const profile = useProfileStore((state) => state.profile);
  const accessToken = useAuthStore((state) => state.accessToken);
  const meQuery = useQuery({
    queryKey: ["members", "me"],
    queryFn: getMe,
    enabled: Boolean(accessToken),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
  const memberId = useMemberId();
  const favoritesQuery = useFavoritesQuery(memberId);
  const bookmarkIds = favoritesQuery.data?.map((favorite) => favorite.movieId) ?? [];
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(bookmarkIds.length / 10));
  const currentPage = Math.min(page, totalPages);
  const visibleIds = bookmarkIds.slice((currentPage - 1) * 10, currentPage * 10);
  const movieQueries = useQueries({
    queries: visibleIds.map((movieId) => ({
      queryKey: ["movies", "detail", movieId],
      queryFn: () => getMovieDetail(movieId),
      staleTime: 30 * 1000,
    })),
  });

  return (
    <div className="flex min-h-[calc(1024px-91px)] min-w-[1024px] flex-col bg-[#f6f7f9] text-[#17191e]">
      <main className="flex-1 px-[80px] pt-[24px] pb-[64px]">
        <div className="mb-[28px] flex items-center justify-between">
          <h1 className="text-[32px] font-extrabold leading-[40px] tracking-[-1px]">내 정보</h1>
          <Link to="/my-page/edit" className="flex h-[40px] items-center rounded-[6px] bg-[#2563eb] px-[16px] text-[13px] font-bold text-white hover:bg-[#1d4ed8]">정보 수정</Link>
        </div>
        <section aria-labelledby="profile-info-heading" className="border-y border-[#e3e6eb] py-[14px]">
          <h2 id="profile-info-heading" className="mb-[16px] text-[16px] font-bold">기본 정보</h2>
          {!accessToken ? (
            <p className="text-[14px] text-[#606774]">로그인 후 내 정보를 확인할 수 있어요. <Link to="/login" className="font-bold text-[#2563eb]">로그인</Link></p>
          ) : meQuery.isLoading ? (
            <p className="text-[14px] text-[#606774]" role="status">내 정보를 불러오는 중이에요.</p>
          ) : meQuery.isError ? (
            <p className="text-[14px] text-red-600" role="alert">내 정보를 불러오지 못했어요.</p>
          ) : meQuery.data ? (
          <div className="flex items-center gap-[28px]">
            <ProfileAvatar image={profile.profileImage} />
            <dl className="grid flex-1 grid-cols-[minmax(240px,0.4fr)_1fr] gap-[24px]">
              <div><dt className="mb-[5px] text-[11px] text-[#969da8]">닉네임</dt><dd className="text-[14px] font-bold">{meQuery.data.nickname}</dd></div>
              <div><dt className="mb-[5px] text-[11px] text-[#969da8]">이메일</dt><dd className="text-[14px] font-bold">{meQuery.data.email}</dd></div>
            </dl>
          </div>
          ) : null}
        </section>
        <section aria-labelledby="bookmarks-heading" className="mt-[28px]">
          <h2 id="bookmarks-heading" className="mb-[14px] text-[16px] font-bold">내 즐겨찾기</h2>
          {memberId === null ? (
            <p className="py-[32px] text-[14px] text-[#606774]">로그인 정보를 확인할 수 없어요. 다시 로그인해 주세요.</p>
          ) : favoritesQuery.isPending ? (
            <p className="py-[32px] text-[14px] text-[#606774]" role="status">즐겨찾기를 불러오는 중이에요.</p>
          ) : favoritesQuery.isError ? (
            <div className="py-[32px] text-[14px]"><p role="alert">즐겨찾기를 불러오지 못했어요.</p><button type="button" onClick={() => favoritesQuery.refetch()} className="mt-[12px] cursor-pointer font-bold text-[#2563eb]">다시 시도</button></div>
          ) : bookmarkIds.length === 0 ? (
            <div className="py-[64px] text-center text-[14px] text-[#606774]"><p>아직 즐겨찾기한 영화가 없어요.</p><Link to="/" className="mt-[12px] inline-block font-bold text-[#2563eb] hover:underline">영화 둘러보기</Link></div>
          ) : (
            <>
              <div className="grid grid-cols-5 gap-x-[18px] gap-y-[21px]">
                {movieQueries.map((query, index) => (
                  <div key={visibleIds[index]}>
                    {query.isPending ? <p className="flex h-[274px] items-center justify-center rounded-[10px] bg-[#e3e6eb] text-[13px] text-[#606774]" role="status">영화를 불러오는 중이에요.</p> : query.isError ? <div className="flex h-[274px] flex-col items-center justify-center gap-[12px] rounded-[10px] bg-[#e3e6eb] text-[13px] text-[#606774]"><p role="alert">영화를 불러오지 못했어요.</p><button type="button" onClick={() => query.refetch()} className="cursor-pointer font-bold text-[#2563eb]">다시 시도</button></div> : <MovieCard movie={query.data} />}
                  </div>
                ))}
              </div>
              <nav aria-label="즐겨찾기 페이지" className="mt-[36px] flex items-center justify-center gap-[14px]">
                <button type="button" aria-label="이전 즐겨찾기 페이지" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)} className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-25"><img src="/icons/movie-icons/chevron-left.svg" alt="" className="h-[20px] w-[20px]" /></button>
                <span aria-current="page" className="flex h-[36px] min-w-[36px] items-center justify-center rounded-[6px] bg-[#17191e] px-[8px] text-[13px] font-bold text-white">{currentPage}</span>
                <button type="button" aria-label="다음 즐겨찾기 페이지" disabled={currentPage === totalPages} onClick={() => setPage(currentPage + 1)} className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-25"><img src="/icons/movie-icons/chevron-right.svg" alt="" className="h-[20px] w-[20px]" /></button>
              </nav>
            </>
          )}
        </section>
      </main>
      <TmdbAttribution />
    </div>
  );
}
