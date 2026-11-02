interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  // 기존처럼 번호를 다섯 개씩 표시하고 현재 페이지가 속한 구간을 보여 줘요.
  const startPage = Math.floor((currentPage - 1) / 5) * 5 + 1
  const pages = Array.from(
    { length: Math.max(0, Math.min(5, totalPages - startPage + 1)) },
    (_, index) => startPage + index,
  )

  return (
    <nav className="pagination" aria-label="영화 목록 페이지">
      <button type="button" className="pagination-arrow" aria-label="이전 페이지" disabled={currentPage <= 1} onClick={() => onPageChange(currentPage - 1)}>
        <img src="/icons/movie-icons/chevron-left.svg" alt="" />
      </button>

      <div className="pagination-pages">
        {pages.map((page) => (
          <button
            type="button"
            className={`page-button${page === currentPage ? ' active' : ''}`}
            aria-current={page === currentPage ? 'page' : undefined}
            key={page}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        ))}
      </div>

      <button type="button" className="pagination-arrow" aria-label="다음 페이지" disabled={currentPage >= totalPages} onClick={() => onPageChange(currentPage + 1)}>
        <img src="/icons/movie-icons/chevron-right.svg" alt="" />
      </button>
    </nav>
  )
}

export default Pagination
