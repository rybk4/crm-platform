import MuiPagination from '@mui/material/Pagination'

import './pagination.css'

interface PaginationProps {
  ariaLabel: string
  page: number
  pages: number
  onChange: (page: number) => void
}

/** Номера страниц под списком; при одной странице не рисуется. */
export function Pagination({ ariaLabel, page, pages, onChange }: PaginationProps) {
  if (pages <= 1) return null

  return (
    <nav className="ui-pagination" aria-label={ariaLabel}>
      <MuiPagination
        count={pages}
        page={page}
        color="primary"
        shape="rounded"
        onChange={(_, next) => onChange(next)}
      />
    </nav>
  )
}
