
function Pagination({ page, totalPages, loading, onPageChange }) {
  if (totalPages <= 1) {
    return null
  }

  return (
    <div className="follow-pagination">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 0 || loading}
      >
        Anterior
      </button>

      <span>
        Página {page + 1} de {totalPages}
      </span>

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page + 1 >= totalPages || loading}
      >
        Siguiente
      </button>
    </div>
  )
}

export default Pagination
