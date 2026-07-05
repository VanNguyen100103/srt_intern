function Pagination({ pageData, onPageChange }) {
  if (pageData.totalPages <= 1) return null

  return (
    <nav className="pagination">
      <button
        className="page-btn"
        disabled={pageData.first}
        onClick={() => onPageChange(pageData.page - 1)}
      >
        ‹
      </button>

      {Array.from({ length: pageData.totalPages }, (_, i) => (
        <button
          key={i}
          className={'page-btn' + (i === pageData.page ? ' active' : '')}
          onClick={() => onPageChange(i)}
        >
          {i + 1}
        </button>
      ))}

      <button
        className="page-btn"
        disabled={pageData.last}
        onClick={() => onPageChange(pageData.page + 1)}
      >
        ›
      </button>

      <span className="page-info">Tổng: {pageData.totalElements} công việc</span>
    </nav>
  )
}

export default Pagination
