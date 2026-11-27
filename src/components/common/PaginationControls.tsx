import React from 'react';

interface PaginationControlsProps {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  page,
  limit,
  total,
  onPageChange,
  onLimitChange,
}) => {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  if (total <= limit) return null;

  const desde = (page - 1) * limit + 1;
  const hasta = Math.min(page * limit, total);

  return (
    <nav
      className="d-flex flex-wrap justify-content-between align-items-center gap-3 mt-3"
      aria-label="Paginación del listado"
    >
      <small className="text-muted">
        Mostrando {desde}-{hasta} de {total}
      </small>
      <div className="d-flex align-items-center gap-2">
        <label className="small text-muted" htmlFor="pagination-page-size">
          Por página
        </label>
        <select
          id="pagination-page-size"
          className="form-select form-select-sm"
          value={limit}
          onChange={(event) => onLimitChange(Number(event.target.value))}
          aria-label="Cantidad de resultados por página"
          style={{ width: 'auto' }}
        >
          {[10, 20, 50].map((size) => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Página anterior"
        >
          Anterior
        </button>
        <span className="small text-muted" aria-live="polite">
          {page} / {totalPages}
        </span>
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Página siguiente"
        >
          Siguiente
        </button>
      </div>
    </nav>
  );
};
