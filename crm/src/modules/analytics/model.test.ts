import { describe, expect, it } from 'vitest'

import { deltaLabelKey, hasAnalyticsData, metricDelta } from './model'
import type { AnalyticsSummary } from './types'

describe('metricDelta', () => {
  it('считает рост в процентах', () => {
    expect(metricDelta({ value: 120, previous: 100 })).toEqual({ percent: 20, direction: 'up' })
  })

  it('считает падение в процентах', () => {
    expect(metricDelta({ value: 80, previous: 100 })).toEqual({ percent: 20, direction: 'down' })
  })

  it('не делит на ноль', () => {
    expect(metricDelta({ value: 10, previous: 0 })).toEqual({ percent: 100, direction: 'up' })
    expect(metricDelta({ value: 0, previous: 0 })).toEqual({ percent: 0, direction: 'flat' })
  })

  it('округляет околонулевое изменение до «без изменений»', () => {
    expect(metricDelta({ value: 1001, previous: 1000 }).direction).toBe('flat')
  })

  it('подбирает ключ подписи под направление', () => {
    expect(deltaLabelKey({ percent: 5, direction: 'up' })).toBe('analyticsGrowth')
    expect(deltaLabelKey({ percent: 5, direction: 'down' })).toBe('analyticsDecline')
    expect(deltaLabelKey({ percent: 0, direction: 'flat' })).toBe('analyticsFlat')
  })
})

describe('hasAnalyticsData', () => {
  const summary = { appointments: { value: 0, previous: 0 } } as AnalyticsSummary

  it('считает период пустым без записей', () => {
    expect(hasAnalyticsData(undefined)).toBe(false)
    expect(hasAnalyticsData(summary)).toBe(false)
  })

  it('видит данные, когда записи есть', () => {
    expect(hasAnalyticsData({ ...summary, appointments: { value: 3, previous: 0 } })).toBe(true)
  })
})
