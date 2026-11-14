import { Link, useParams } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMovieDetail } from "../../api/movies/get-movie-detail";
import { BookmarkButton } from "../../components/bookmark-button";
import { MovieRatingSection } from "@/components/movies/movie-rating-section";
import { TmdbAttribution } from "../../components/layout/tmdb-attribution";
import { getMovieDetailErrorMessage } from "../../utils/movies/get-movie-detail-error-message";
import { getTmdbBackdropUrl, getTmdbPosterUrl } from "../../utils/movies/tmdb-image";

function MovieDetailLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-[calc(1024px-91px)] min-w-[1024px] flex-col bg-[#f6f7f9] text-[#17191e]">
      {children}
      <TmdbAttribution />
    </div>
  );
}

export function MovieDetailPage() {
  const { movieId: movieIdParam } = useParams({ from: "/movies/$movieId" });
  const movieId = Number(movieIdParam);
  const isValidMovieId = Number.isInteger(movieId) && movieId > 0;

  const movieDetailQuery = useQuery({
    queryKey: ["movies", "detail", movieId],
    queryFn: () => getMovieDetail(movieId),
    enabled: isValidMovieId,
    staleTime: 30 * 1000,
  });

  if (!isValidMovieId) {
    return <MovieDetailLayout><main role="alert">올바르지 않은 영화 번호예요.</main></MovieDetailLayout>;
  }

  if (movieDetailQuery.isPending) {
    return <MovieDetailLayout><main role="status">영화 정보를 불러오는 중이에요.</main></MovieDetailLayout>;
  }

  if (movieDetailQuery.isError) {
    return <MovieDetailLayout><main role="alert">{getMovieDetailErrorMessage(movieDetailQuery.error)}</main></MovieDetailLayout>;
  }

  const movie = movieDetailQuery.data;

  const posterUrl = getTmdbPosterUrl(movie.poster_path);
  const backdropUrl = getTmdbBackdropUrl(movie.backdrop_path);
  const runtimeText = typeof movie.runtime === "number"
    ? `${Math.floor(movie.runtime / 60)}시간 ${movie.runtime % 60}분`
    : "상영 시간 정보가 없어요.";

  return (
    <MovieDetailLayout>
    <main>
      {backdropUrl && <img src={backdropUrl} alt="" aria-hidden="true" />}
      <Link to="/">영화 목록</Link>
      {posterUrl ? (
        <img src={posterUrl} alt={`${movie.title} 포스터`} />
      ) : (
        <p>포스터 정보가 없어요.</p>
      )}
      <h1>{movie.title}</h1>
      <BookmarkButton movieId={movie.id} movieTitle={movie.title} />
      <p>{movie.original_title}</p>
      <p>{movie.release_date}</p>
      <p>{movie.genres.map((genre) => genre.name).join(", ")}</p>
      <p>{runtimeText}</p>
      <h2>{movie.tagline}</h2>
      <p>{movie.overview}</p>
    </main>
    <MovieRatingSection movieId={movie.id} />
    </MovieDetailLayout>
  );
}
