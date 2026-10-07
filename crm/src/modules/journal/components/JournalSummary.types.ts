import type { DayTotals } from '../model'

export interface JournalSummaryProps {
  totals: DayTotals
  availableMinutes: number
  currency: string
}
