import type { Specialist } from '@/modules/specialists/types'
import type { EntityId } from '@/lib/api/entityId'
import type { DayWindow } from '../model'
import type { Appointment } from '../types'
import type { JournalView } from '../hooks/useJournalFilters'

export interface JournalContentProps {
  step?: number
  loading: boolean
  view: JournalView
  columns: readonly Specialist[]
  appointments: readonly Appointment[]
  bounds: DayWindow
  day: Date
  end?: string
  now: Date | null
  onOpen: (appointment: Appointment) => void
  onCreate: (specialistId?: EntityId, startTime?: string, date?: string) => void
}
