import { ChevronLeft, ChevronRight } from "lucide-react";
import "./Pagination.css";

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="pagination">
      <button
        type="button"
        className="pagination-btn"
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        aria-label="Page précédente"
      >
        <ChevronLeft size={16} />
      </button>
      <span className="pagination-info">
        Page {page} / {totalPages}
      </span>
      <button
        type="button"
        className="pagination-btn"
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        aria-label="Page suivante"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

export default Pagination;
