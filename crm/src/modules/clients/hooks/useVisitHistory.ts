import { useMemo, useState } from 'react'

import {
  currentMonthPeriod,
  sortVisits,
  toggleVisitSort,
  visitTotals,
  visitsInPeriod,
} from '../visitHistory'
import type { VisitPeriod, VisitSort, VisitSortKey } from '../visitHistory'
import { useClientVisits } from './useClientVisits'

/** Вкладка «История посещений»: период (по умолчанию текущий месяц), сортировка и итоги. */
export function useVisitHistory(clientId: number) {
  const visits = useClientVisits(clientId)
  const [period, setPeriod] = useState<VisitPeriod>(() => currentMonthPeriod())
  const [sort, setSort] = useState<VisitSort>({ key: 'date', direction: 'asc' })

  const rows = useMemo(
    () => sortVisits(visitsInPeriod(visits.data ?? [], period), sort),
    [visits.data, period, sort],
  )

  return {
    rows,
    totals: visitTotals(rows),
    isLoading: visits.isPending,
    isError: visits.isError,
    retry: () => void visits.refetch(),
    period,
    setPeriod: (changes: Partial<VisitPeriod>) =>
      setPeriod((current) => ({ ...current, ...changes })),
    sort,
    toggleSort: (key: VisitSortKey) => setSort((current) => toggleVisitSort(current, key)),
  }
}
