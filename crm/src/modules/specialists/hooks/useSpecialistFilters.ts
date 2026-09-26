import { useMemo, useState } from 'react'

import { filterSpecialists } from '../model'
import type { SpecialistSort, SpecialistStatusFilter } from '../model'
import type { Specialist } from '../types'

export function useSpecialistFilters(specialists: readonly Specialist[]) {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<SpecialistStatusFilter>('all')
  const [sort, setSort] = useState<SpecialistSort>('recent')
  const [position, setPosition] = useState('')
  const items = useMemo(
    () => filterSpecialists(specialists, { search, status, sort, position }),
    [position, search, sort, specialists, status],
  )

  return {
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
