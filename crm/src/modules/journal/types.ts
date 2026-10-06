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
  id: EntityId
  branch: EntityId
  branch_name: string
  specialist: EntityId
  specialist_name: string
  service: EntityId
  service_name: string
  client: EntityId
  client_name: string
  client_phone: string
  deal?: EntityId | null
  deal_status?: 'open' | 'paid' | 'cancelled'
  deal_payment_method?: EntityId | null
  deal_discount?: string
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

export interface DealPaymentInput {
  payment_method: EntityId
  discount: string
  comment: string
}
import type { EntityId } from '@/lib/api/entityId'
