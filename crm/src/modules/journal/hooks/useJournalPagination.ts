import { useState } from 'react'
import { useElementWidth } from '@/lib/browser/useElementWidth'
export function useJournalPagination(total: number) {
  const { elementRef, width } = useElementWidth<HTMLDivElement>()
  const [requestedPage, setPage] = useState(1)
  const pageSize = Math.max(1, Math.min(5, Math.floor((width - 88) / 184)))
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const page = Math.min(requestedPage, pages)
  return { elementRef, page, pages, setPage, from: (page - 1) * pageSize, to: page * pageSize }
}
