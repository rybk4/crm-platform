import type { ClientVisit } from '../types'
import type { VisitSort, VisitSortKey, VisitTotals } from '../visitHistory'

export interface VisitHistoryTableProps {
  rows: ClientVisit[]
  totals: VisitTotals
  sort: VisitSort
  onSort: (key: VisitSortKey) => void
}
