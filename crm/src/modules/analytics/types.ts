import type { AppointmentStatus } from '@/modules/journal/types'

export const analyticsPeriods = [7, 30, 90] as const

export type AnalyticsPeriod = (typeof analyticsPeriods)[number]

/** Значение показателя вместе с тем же показателем за предыдущий период. */
export interface AnalyticsMetric {
  value: number
  previous: number
}

export interface AnalyticsPoint {
  date: string
  value: number
}

export interface SpecialistLoadItem {
  specialist_id: number
  specialist_name: string
  booked_minutes: number
  available_minutes: number
  load_percent: number
  revenue: string
}

export interface TopServiceItem {
  service_id: number
  service_name: string
  appointments_count: number
  revenue: string
}

export interface StatusBreakdownItem {
  status: AppointmentStatus
  count: number
}

export interface AnalyticsSummary {
  period_days: number
  currency: string
  revenue: AnalyticsMetric
  appointments: AnalyticsMetric
  new_clients: AnalyticsMetric
  average_check: AnalyticsMetric
  load_percent: AnalyticsMetric
  cancel_rate: AnalyticsMetric
  revenue_by_day: AnalyticsPoint[]
  specialist_load: SpecialistLoadItem[]
  top_services: TopServiceItem[]
  status_breakdown: StatusBreakdownItem[]
}
