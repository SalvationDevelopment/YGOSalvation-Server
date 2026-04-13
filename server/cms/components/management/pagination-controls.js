"use client";

/**
 * Renders the Pagination Controls component and returns the UI used by the pagination controls view.
 * @param {Object} props The props object supplies the structured input used by the pagination controls module, including the `onPageChange`, `page`, and `totalPages` properties.
 * @param {Function} props.onPageChange The `onPageChange` property supplies structured input used by the pagination controls module.
 * @param {number} props.page The `page` property supplies structured input used by the pagination controls module.
 * @param {number} props.totalPages The `totalPages` property supplies structured input used by the pagination controls module.
 * @returns {React.ReactNode} Returns the rendered UI used by the pagination controls view.
 */
export default function PaginationControls({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="pagination-row">
      <button className="btn" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
        Prev
      </button>
      <span className="muted">Page {page} of {totalPages}</span>
      <button className="btn" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}>
        Next
      </button>
    </div>
  );
}
