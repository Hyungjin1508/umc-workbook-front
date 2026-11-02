import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState, type SubmitEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchMovies } from "../../api/movies/search-movies";
import { BookmarkButton } from "../../components/bookmark-button";
import { TmdbAttribution } from "../../components/layout/tmdb-attribution";

function SearchForm({ query, isResults }: { query: string; isResults: boolean }) {
  const navigate = useNavigate({ from: "/search" });
  const [searchText, setSearchText] = useState(query);

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextQuery = searchText.trim();
    navigate({ search: nextQuery ? { query: nextQuery } : {} });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex h-[56px] w-full items-center gap-[16px] rounded-[8px] bg-white px-[16px] ${isResults ? "border border-[#e3e6eb]" : "border border-[#17191e] shadow-[0_4px_16px_#17191e14]"}`}
      role="search"
    >
      <img className="h-[20px] w-[20px] shrink-0 opacity-60" src="/icons/movie-icons/search.svg" alt="" />
      <input
        className="min-w-0 flex-1 bg-transparent text-[14px] leading-[20px] text-[#17191e] outline-none placeholder:text-[#969da8]"
        type="search"
        aria-label="검색어"
        placeholder="예: 스파이더맨"
        value={searchText}
        onChange={(event) => setSearchText(event.target.value)}
      />
      {searchText && (
        <button
          className="flex h-[28px] w-[28px] shrink-0 cursor-pointer items-center justify-center rounded-[4px]"
          type="button"
          aria-label="검색어 지우기"
          onClick={() => setSearchText("")}
        >
          <img className="h-[16px] w-[16px] opacity-60" src="/icons/movie-icons/close.svg" alt="" />
        </button>
      )}
      <button className="h-[38px] shrink-0 cursor-pointer rounded-[6px] bg-[#17191e] px-[18px] text-[14px] font-bold text-white" type="submit">
        {isResults ? "다시 검색" : "검색"}
      </button>
    </form>
  );
}

export function SearchPage() {
  const { query } = useSearch({ from: "/search" });
  const normalizedQuery = query?.trim() ?? "";

  const searchQuery = useQuery({
    queryKey: ["movies", "search", { query: normalizedQuery }],
    queryFn: () => searchMovies({ query: normalizedQuery }),
    enabled: normalizedQuery.length > 0,
  });

  const searchResults = searchQuery.data?.results ?? [];

  return (
    <div className="flex min-h-[calc(1024px-91px)] min-w-[1024px] flex-col bg-[#f6f7f9] text-[#17191e]">
      <main className="w-full flex-1 px-[80px] pt-[24px] pb-[64px]">
        {!normalizedQuery ? (
          <div className="mx-auto mt-[190px] w-[780px]">
            <h1 className="m-0 mb-[36px] text-center text-[38px] font-bold leading-[46px] tracking-[-1.71px]">어떤 영화를 찾고 있나요?</h1>
            <SearchForm key={query ?? ""} query={query ?? ""} isResults={false} />
          </div>
        ) : (
          <>
            <h1 className="m-0 mb-[20px] text-[38px] font-bold leading-[44px] tracking-[-1.71px]">영화 검색</h1>
            <SearchForm key={query ?? ""} query={query ?? ""} isResults />
            <div className="mt-[20px] flex items-center justify-between border-b border-[#e3e6eb] pb-[18px]">
              <h2 className="m-0 text-[18px] font-bold leading-[24px]">‘{normalizedQuery}’ 검색 결과</h2>
              {searchQuery.isSuccess && <p className="m-0 text-[13px] text-[#969da8]" role="status">영화 {searchResults.length}편</p>}
            </div>
            {searchQuery.isLoading ? (
              <p className="py-[80px] text-center text-[16px] text-[#606774]" role="status">검색 결과를 불러오는 중이에요.</p>
            ) : searchQuery.isError ? (
              <p className="py-[80px] text-center text-[16px] text-red-600" role="alert">{searchQuery.error.message}</p>
            ) : searchQuery.isSuccess && searchResults.length === 0 ? (
              <p className="py-[80px] text-center text-[16px] text-[#606774]">검색 결과가 없어요. 다른 영화 제목으로 검색해 주세요.</p>
            ) : (
              <ul className="m-0 grid list-none grid-cols-2 gap-x-[40px] p-0">
                {searchResults.map((movie) => (
                  <li key={movie.id} className="flex min-w-0 gap-[18px] border-b border-[#e3e6eb] py-[24px]">
                    <Link to="/movies/$movieId" params={{ movieId: String(movie.id) }} className="block h-[190px] w-[126px] shrink-0 overflow-hidden rounded-[8px]" aria-label={`${movie.title} 상세 보기`}>
                      <img className="h-full w-full object-cover" src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : "/icons/movie-icons/movie.svg"} alt={`${movie.title} 포스터`} />
                    </Link>
                    <div className="flex min-w-0 flex-1 flex-col items-start py-[4px]">
                      <div className="flex w-full items-start justify-between gap-[12px]">
                        <h3 className="m-0 text-[18px] font-bold leading-[25px]">{movie.title}</h3>
                        <BookmarkButton movieId={movie.id} movieTitle={movie.title} variant="icon" />
                      </div>
                      <p className="mt-[6px] text-[12px] leading-[18px] text-[#969da8]">{movie.original_title} · {movie.release_date}</p>
                      <p className="mt-[12px] line-clamp-3 text-[13px] leading-[21px] text-[#606774]">{movie.overview}</p>
                      <Link to="/movies/$movieId" params={{ movieId: String(movie.id) }} className="mt-auto inline-flex items-center gap-[4px] pt-[14px] text-[13px] font-bold text-[#2563eb] no-underline hover:underline">
                        상세 보기 <span aria-hidden="true">→</span>
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </main>
      {normalizedQuery && <TmdbAttribution />}
    </div>
  );
}

