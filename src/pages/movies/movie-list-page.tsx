import MovieGrid from '../../components/movies/movie-grid'
import Pagination from '../../components/movies/pagination'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getMovies } from '../../api/movies/get-movies'
import { TmdbAttribution } from '../../components/layout/tmdb-attribution'

export function MovieListPage() {
  const [page, setPage] = useState(1)

  const moviesQuery = useQuery({
    queryKey: ['movies', 'list', { page }],
    queryFn: () => getMovies({ page }),
  })

  const movies = moviesQuery.data?.results ?? []
  const totalPages = moviesQuery.data?.total_pages ?? 0

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage)
  }

  return (
    <div className="relative flex min-h-[1024px] min-w-[1024px] flex-col bg-[#f6f7f9] text-[#17191e]">
      {/* 💡 Header를 완전히 제거하고 main 영역부터 시작합니다! */}
      <main className="w-full px-[80px] pt-[24px] pb-[80px]" id="movies">
        <h1 className="m-0 mb-[20px] text-[38px] font-bold leading-[44px] tracking-[-1.71px]">영화 목록</h1>
        {moviesQuery.isPending ? (
          <p className="mb-[20px] text-[#606774]" role="status">영화 목록을 불러오는 중이에요.</p>
        ) : moviesQuery.isError ? (
          <p className="mb-[20px] text-red-600" role="alert">{moviesQuery.error.message}</p>
        ) : movies.length === 0 ? (
          <p className="py-[80px] text-center text-[#606774]" role="status">표시할 영화가 없어요.</p>
        ) : (
          <>
            <MovieGrid movies={movies} />
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
          </>
        )}
      </main>

      <TmdbAttribution />
    </div>
  )
}


