import type { JournalDateRange } from '../calendarModel'
import type { EntityId } from '@/lib/api/entityId'
import type { Specialist } from '@/modules/specialists/types'
export interface JournalToolbarProps {
  date: string
  range: JournalDateRange | null
  onRangeChange: (range: JournalDateRange) => void
  isToday: boolean
  specialists: readonly Specialist[]
  specialist: EntityId | null
  step: number
  onDateChange: (date: string) => void
  onShift: (days: number) => void
  onToday: () => void
  onSpecialistChange: (specialist: EntityId | null) => void
  onFilter: () => void
  onStepChange: (step: number) => void
}
