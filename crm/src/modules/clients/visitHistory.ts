import { dayKey } from '@/lib/datetime/day'
import type { TranslationKey } from '@/lib/i18n/messages'
import type { ClientVisit } from './types'

/** Чистые правила вкладки «История посещений»: период, сортировка, итоги. */

export const visitSortKeys = ['date', 'time', 'specialist', 'service', 'duration', 'price'] as const

export type VisitSortKey = (typeof visitSortKeys)[number]

export interface VisitSort {
  key: VisitSortKey
  direction: 'asc' | 'desc'
}

export interface VisitPeriod {
  /** YYYY-MM-DD, включительно. */
  from: string
  to: string
}

export function currentMonthPeriod(now = new Date()): VisitPeriod {
  return {
    from: dayKey(new Date(now.getFullYear(), now.getMonth(), 1)),
    to: dayKey(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
  }
}

export function visitsInPeriod(visits: readonly ClientVisit[], period: VisitPeriod) {
  return visits.filter((visit) => {
    const day = dayKey(new Date(visit.starts_at))
    return (!period.from || day >= period.from) && (!period.to || day <= period.to)
  })
}

function minutesOfDay(value: string) {
  const date = new Date(value)
  return date.getHours() * 60 + date.getMinutes()
}

function comparable(visit: ClientVisit, key: VisitSortKey): number | string {
  if (key === 'date') return new Date(visit.starts_at).getTime()
  if (key === 'time') return minutesOfDay(visit.starts_at)
  if (key === 'specialist') return visit.specialist_name
  if (key === 'service') return visit.service_name
  if (key === 'duration') return visit.duration_minutes
  return Number(visit.price)
}

export function sortVisits(visits: readonly ClientVisit[], sort: VisitSort) {
  const sign = sort.direction === 'asc' ? 1 : -1

  return [...visits].sort((left, right) => {
    const a = comparable(left, sort.key)
    const b = comparable(right, sort.key)
    const order =
      typeof a === 'number' && typeof b === 'number' ? a - b : String(a).localeCompare(String(b))
    return order * sign
  })
}

/** Повторный клик по активной колонке разворачивает порядок, по новой — сортирует по возрастанию. */
export function toggleVisitSort(current: VisitSort, key: VisitSortKey): VisitSort {
  if (current.key !== key) return { key, direction: 'asc' }
  return { key, direction: current.direction === 'asc' ? 'desc' : 'asc' }
}

export interface VisitTotals {
  count: number
  specialists: number
  services: number
  minutes: number
  amount: number
}

export function visitTotals(visits: readonly ClientVisit[]): VisitTotals {
  return {
    count: visits.length,
    specialists: new Set(visits.map((visit) => visit.specialist_name)).size,
    services: new Set(visits.map((visit) => visit.service_name)).size,
    minutes: visits.reduce((sum, visit) => sum + visit.duration_minutes, 0),
    amount: visits.reduce((sum, visit) => sum + Number(visit.price), 0),
  }
}

/** «30 мин», «3 ч» или «3 ч 30 мин» — без нулевых частей. */
export function durationLabel(total: number): {
  key: TranslationKey
  params: { hours: number; minutes: number }
} {
  const params = { hours: Math.floor(total / 60), minutes: total % 60 }
  if (!params.hours) return { key: 'clientHistoryMinutes', params }
  if (!params.minutes) return { key: 'clientHistoryHours', params }
  return { key: 'clientHistoryHoursMinutes', params }
}
