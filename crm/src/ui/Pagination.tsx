import MuiPagination from '@mui/material/Pagination'

import type { PaginationProps } from './Pagination.types'
export type { PaginationProps } from './Pagination.types'

import './pagination.css'

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
