import type { AppointmentStatus } from '@/modules/journal/types'

export const clientSegments = ['new', 'regular', 'vip', 'sleeping'] as const

export type ClientSegment = (typeof clientSegments)[number]

export interface Client {
  id: number
  organization_id: number
  name: string
  phone_number: string
  email: string
  birthday: string | null
  note: string
  segment: ClientSegment
  visits_count: number
  total_spent: string
  average_check: string
  currency: string
  first_visit_at: string | null
  last_visit_at: string | null
  created_at: string
}

export interface ClientVisit {
  id: number
  starts_at: string
  service_name: string
  specialist_name: string
  price: string
  currency: string
  status: AppointmentStatus
}

export type ClientInput = Pick<Client, 'name' | 'phone_number' | 'email' | 'birthday' | 'note'>
