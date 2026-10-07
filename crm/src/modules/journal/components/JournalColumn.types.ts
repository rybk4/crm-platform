import type { EntityId } from '@/lib/api/entityId'
import type { Specialist } from '@/modules/specialists/types'
import type { DayWindow } from '../model'
import type { Appointment } from '../types'

export interface JournalColumnProps {
  specialist: Specialist
  window: DayWindow | null
  bounds: DayWindow
  appointments: readonly Appointment[]
  height: number
  onOpen: (appointment: Appointment) => void
  onCreate: (specialistId?: EntityId, startTime?: string) => void
}
