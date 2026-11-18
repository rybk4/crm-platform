import { useMemo, useState } from 'react'

import { filterSpecialists } from '../model'
import type { SpecialistSort, SpecialistStatusFilter } from '../model'
import type { Specialist } from '../types'

export function useSpecialistFilters(specialists: readonly Specialist[]) {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<SpecialistStatusFilter>('all')
  const [sort, setSort] = useState<SpecialistSort>('none')
  const [position, setPosition] = useState('')
  const items = useMemo(
    () => filterSpecialists(specialists, { search, status, sort, position }),
    [position, search, sort, specialists, status],
  )

  const [pagination, setPagination] = useState({ page: 1, search, status, sort, position })
  const pageCount = Math.max(1, Math.ceil(items.length / 9))
  const sameFilters =
    pagination.search === search &&
    pagination.status === status &&
    pagination.sort === sort &&
    pagination.position === position
  if (!sameFilters) setPagination({ page: 1, search, status, sort, position })
  const page = sameFilters ? Math.min(pagination.page, pageCount) : 1

  function setPage(nextPage: number) {
    setPagination({ page: nextPage, search, status, sort, position })
  }

  return {
    page,
    pageCount,
    setPage,
    pageItems: items.slice((page - 1) * 9, page * 9),
    items,
    search,
    setSearch,
    status,
    setStatus,
    sort,
    setSort,
    position,
    setPosition,
  }
}
