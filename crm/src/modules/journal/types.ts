export const appointmentStatuses = [
  'pending',
  'confirmed',
  'completed',
  'cancelled',
  'no_show',
] as const

export type AppointmentStatus = (typeof appointmentStatuses)[number]

export const appointmentSources = ['crm', 'online', 'phone'] as const

export type AppointmentSource = (typeof appointmentSources)[number]

export interface Appointment {
  id: number
  branch: number
  branch_name: string
  specialist: number
  specialist_name: string
  service: number
  service_name: string
  client: number
  client_name: string
  client_phone: string
  /** ISO 8601 с часовым поясом клиента, как отдаёт DRF. */
  starts_at: string
  ends_at: string
  duration_minutes: number
  price: string
  currency: string
  status: AppointmentStatus
  source: AppointmentSource
  comment: string
  created_at: string
}

export type AppointmentInput = Pick<
  Appointment,
  'specialist' | 'service' | 'client' | 'starts_at' | 'status' | 'comment'
>
