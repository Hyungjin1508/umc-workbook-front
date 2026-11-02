import MovieCard from './movie-card'
import type { TmdbMovieListItem } from '../../api/movies/models'

interface MovieGridProps {
  movies: TmdbMovieListItem[]
}

function MovieGrid({ movies }: MovieGridProps) {
  return (
    <section className="grid grid-cols-5 gap-x-[18px] gap-y-[21px]" aria-label="영화 목록">
      {movies.map((movie) => (
        <MovieCard
          key={movie.id}
          movie={movie}
        />
      ))}
    </section>
  )
}

export default MovieGrid

