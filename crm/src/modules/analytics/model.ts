import type { TranslationKey } from '@/lib/i18n/messages'
import type { StatDirection } from '@/ui/StatTile'
import type { AnalyticsMetric, AnalyticsPeriod, AnalyticsSummary } from './types'

export const periodLabelKeys: Record<AnalyticsPeriod, TranslationKey> = {
  7: 'analyticsPeriod7',
  30: 'analyticsPeriod30',
  90: 'analyticsPeriod90',
}

export interface MetricDelta {
  percent: number
  direction: StatDirection
}

/**
 * Изменение показателя к прошлому периоду. Прошлый ноль сравнивать не с чем:
 * показываем рост на 100%, если сейчас есть хоть что-то.
 */
export function metricDelta(metric: AnalyticsMetric): MetricDelta {
  if (metric.previous === 0) {
    return metric.value === 0
      ? { percent: 0, direction: 'flat' }
      : { percent: 100, direction: 'up' }
  }

  const change = ((metric.value - metric.previous) / Math.abs(metric.previous)) * 100
  const percent = Math.abs(Math.round(change))

  if (percent === 0) return { percent: 0, direction: 'flat' }
  return { percent, direction: change > 0 ? 'up' : 'down' }
}

export function deltaLabelKey(delta: MetricDelta): TranslationKey {
  if (delta.direction === 'up') return 'analyticsGrowth'
  if (delta.direction === 'down') return 'analyticsDecline'
  return 'analyticsFlat'
}

export function hasAnalyticsData(summary: AnalyticsSummary | undefined) {
  return Boolean(summary && summary.appointments.value > 0)
}
