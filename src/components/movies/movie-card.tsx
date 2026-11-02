import { Link } from '@tanstack/react-router'
import type { TmdbMovieListItem } from '../../api/movies/models'
import { getTmdbPosterUrl } from '../../utils/movies/tmdb-image'
import { BookmarkButton } from '../bookmark-button'

interface MovieCardProps {
  movie: Pick<TmdbMovieListItem, 'id' | 'title' | 'poster_path' | 'release_date'>
}

function MovieCard({ movie }: MovieCardProps) {
  return (
    <article className="flex min-w-0 flex-col items-start gap-[4px]">
      {/* 포스터 박스 */}
      <div className="relative h-[274px] w-full overflow-hidden rounded-[10px] bg-[#e3e6eb]">
        <Link
          to="/movies/$movieId"
          params={{ movieId: String(movie.id) }}
          aria-label={movie.title}
          className="block h-full w-full"
        >
          <img
            className="block h-full w-full object-cover"
            src={getTmdbPosterUrl(movie.poster_path) ?? '/icons/movie-icons/movie.svg'}
            alt={`${movie.title} 포스터`}
          />
        </Link>

        {/* 북마크 버튼 */}
        <BookmarkButton movieId={movie.id} movieTitle={movie.title} variant="icon" className="absolute right-[10px] top-[10px]" />
      </div>

      {/* 영화 제목 */}
      <h2 className="m-0 w-full overflow-hidden text-ellipsis whitespace-nowrap pt-[5px] text-[14px] font-[800] leading-[17px] text-[#17191e]">
        <Link
          to="/movies/$movieId"
          params={{ movieId: String(movie.id) }}
          className="text-[#17191e] no-underline hover:underline"
        >
          {movie.title}
        </Link>
      </h2>

      {/* 개봉일 */}
      <time
        dateTime={movie.release_date}
        className="text-[12px] font-[400] leading-[14px] text-[#969da8]"
      >
        {movie.release_date}
      </time>
    </article>
  )
}

export default MovieCard

