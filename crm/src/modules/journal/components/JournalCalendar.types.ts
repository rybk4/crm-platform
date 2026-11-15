import type { JournalDateRange } from '../calendarModel'
export interface JournalCalendarProps {
  date: string
  range: JournalDateRange | null
  rangeEnabled: boolean
  onDateChange: (date: string) => void
  onRangeChange: (range: JournalDateRange) => void
}
