import { describe, expect, it } from 'vitest'

import type { ClientVisit } from '../types'
import {
  currentMonthPeriod,
  durationLabel,
  sortVisits,
  toggleVisitSort,
  visitTotals,
  visitsInPeriod,
} from '../visitHistory'

function makeVisit(overrides: Partial<ClientVisit>): ClientVisit {
  return {
    id: 1,
    starts_at: new Date(2026, 8, 10, 10, 0).toISOString(),
    service_name: 'Стрижка',
    specialist_name: 'Ким Анна',
    duration_minutes: 60,
    price: '9000',
    currency: 'KZT',
    status: 'completed',
    ...overrides,
  }
}

const visits = [
  makeVisit({ id: 1, starts_at: new Date(2026, 8, 10, 15, 0).toISOString(), price: '5000' }),
  makeVisit({
    id: 2,
    starts_at: new Date(2026, 8, 3, 9, 30).toISOString(),
    service_name: 'Маникюр',
    specialist_name: 'Ли Дана',
    duration_minutes: 90,
  }),
  makeVisit({ id: 3, starts_at: new Date(2026, 7, 28, 12, 0).toISOString() }),
]

describe('currentMonthPeriod', () => {
  it('берёт месяц целиком', () => {
    expect(currentMonthPeriod(new Date(2026, 1, 14))).toEqual({
      from: '2026-02-01',
      to: '2026-02-28',
    })
  })
})

describe('visitsInPeriod', () => {
  it('оставляет визиты внутри периода включительно', () => {
    const inSeptember = visitsInPeriod(visits, { from: '2026-09-01', to: '2026-09-10' })
    expect(inSeptember.map((item) => item.id)).toEqual([1, 2])
  })

  it('пустая граница не ограничивает', () => {
    expect(visitsInPeriod(visits, { from: '', to: '' })).toHaveLength(3)
  })
})

describe('sortVisits', () => {
  it('сортирует по дате, времени дня, строкам и цене', () => {
    const ids = (key: Parameters<typeof sortVisits>[1]['key'], direction: 'asc' | 'desc' = 'asc') =>
      sortVisits(visits, { key, direction }).map((item) => item.id)

    expect(ids('date')).toEqual([3, 2, 1])
    expect(ids('time')).toEqual([2, 3, 1])
    expect(ids('specialist')).toEqual([1, 3, 2])
    expect(ids('price', 'desc')).toEqual([2, 3, 1])
  })
})

describe('toggleVisitSort', () => {
  it('разворачивает активную колонку и начинает новую с возрастания', () => {
    expect(toggleVisitSort({ key: 'date', direction: 'asc' }, 'date').direction).toBe('desc')
    expect(toggleVisitSort({ key: 'date', direction: 'desc' }, 'price')).toEqual({
      key: 'price',
      direction: 'asc',
    })
  })
})

describe('visitTotals', () => {
  it('считает записи, уникальных специалистов и услуги, время и сумму', () => {
    expect(visitTotals(visits)).toEqual({
      count: 3,
      specialists: 2,
      services: 2,
      minutes: 210,
      amount: 23000,
    })
  })

  it('подписывает длительность без нулевых частей', () => {
    expect(durationLabel(210)).toEqual({
      key: 'clientHistoryHoursMinutes',
      params: { hours: 3, minutes: 30 },
    })
    expect(durationLabel(45).key).toBe('clientHistoryMinutes')
    expect(durationLabel(120).key).toBe('clientHistoryHours')
  })
})
