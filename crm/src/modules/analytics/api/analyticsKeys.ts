import type { AnalyticsPeriod } from '../types'

export const analyticsKeys = {
  all: ['analytics'] as const,
  summary: (period: AnalyticsPeriod) => [...analyticsKeys.all, 'summary', period] as const,
}
