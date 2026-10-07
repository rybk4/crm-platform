import type { Appointment } from '../types'

export interface JournalListProps {
  appointments: readonly Appointment[]
  onOpen: (appointment: Appointment) => void
}
