export interface PaginationProps {
  ariaLabel: string
  page: number
  pages: number
  onChange: (page: number) => void
}
