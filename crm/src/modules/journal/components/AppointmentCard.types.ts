import type { Appointment } from '../types'

export interface AppointmentCardProps {
  appointment: Appointment
  style?: { top: number; height: number }
  onOpen: (appointment: Appointment) => void
}
