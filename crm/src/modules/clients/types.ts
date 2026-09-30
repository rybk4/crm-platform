import type { AppointmentStatus } from '@/modules/journal/types'

export const clientSegments = ['new', 'regular', 'vip', 'sleeping'] as const

export type ClientSegment = (typeof clientSegments)[number]

/** Статус, который администратор ставит руками, — в отличие от вычисляемого сегмента. */
export const clientStatuses = ['basic', 'vip', 'blocked'] as const

export type ClientStatus = (typeof clientStatuses)[number]

export const clientGenders = ['male', 'female'] as const

export type ClientGender = (typeof clientGenders)[number]

export interface ClientRecentVisit {
  id: number
  starts_at: string
  service_name: string
  status: AppointmentStatus
}

export interface Client {
  id: number
  organization_id: number
  /** Полное имя «Фамилия Имя Отчество» — собирает сервер. */
  name: string
  last_name: string
  first_name: string
  middle_name: string
  phone_number: string
  email: string
  birthday: string | null
  gender: ClientGender | null
  status: ClientStatus
  discount_percent: number | null
  height_cm: number | null
  weight_kg: number | null
  note: string
  segment: ClientSegment
  visits_count: number
  total_spent: string
  average_check: string
  currency: string
  first_visit_at: string | null
  last_visit_at: string | null
  /** Последние семь записей по времени — для карточки в списке. */
  recent_visits: ClientRecentVisit[]
  created_at: string
}

export interface ClientVisit {
  id: number
  starts_at: string
  service_name: string
  specialist_name: string
  duration_minutes: number
  price: string
  currency: string
  status: AppointmentStatus
}

export type ClientInput = Pick<
  Client,
  | 'last_name'
  | 'first_name'
  | 'middle_name'
  | 'phone_number'
  | 'email'
  | 'birthday'
  | 'gender'
  | 'status'
  | 'discount_percent'
  | 'height_cm'
  | 'weight_kg'
  | 'note'
>

/** Фильтры, которые считает сервер: по ним нужны записи, а не только карточка клиента. */
export interface ClientListFilters {
  status?: ClientStatus
  service?: number
  visit_date?: string
}
