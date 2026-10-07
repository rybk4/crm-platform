import type { Specialist } from '@/modules/specialists/types'
import type { EntityId } from '@/lib/api/entityId'
import type { DayWindow } from '../model'
import type { Appointment } from '../types'

export interface JournalBoardProps {
  specialists: readonly Specialist[]
  appointments: readonly Appointment[]
  bounds: DayWindow
  day: Date
  /** Метку «сейчас» рисуем только на сегодняшнем дне. */
  now: Date | null
  onOpen: (appointment: Appointment) => void
  onCreate: (specialistId?: EntityId, startTime?: string) => void
}
