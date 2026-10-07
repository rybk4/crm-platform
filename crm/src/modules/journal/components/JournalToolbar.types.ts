import type { EntityId } from '@/lib/api/entityId'
import type { Specialist } from '@/modules/specialists/types'
import type { AppointmentStatus } from '../types'
import type { JournalView } from '../hooks/useJournalFilters'

export interface JournalToolbarProps {
  date: string
  isToday: boolean
  specialists: readonly Specialist[]
  specialist: EntityId | null
  status: AppointmentStatus | null
  view: JournalView
  onDateChange: (date: string) => void
  onShift: (days: number) => void
  onToday: () => void
  onSpecialistChange: (specialist: EntityId | null) => void
  onStatusChange: (status: AppointmentStatus | null) => void
  onViewChange: (view: JournalView) => void
}
