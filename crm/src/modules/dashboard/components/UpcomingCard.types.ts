import type { Appointment } from '@/modules/journal/types'

export interface UpcomingCardProps {
  appointments: readonly Appointment[]
  now: Date
}
