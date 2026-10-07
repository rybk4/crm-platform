import type { Appointment } from '../types'

export interface JournalWeekProps {
  start: Date
  appointments: readonly Appointment[]
  onOpen: (appointment: Appointment) => void
}
