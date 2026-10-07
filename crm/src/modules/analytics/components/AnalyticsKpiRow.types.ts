import type { IconName } from '@/ui/Icon'
import type { AnalyticsMetric, AnalyticsSummary } from '../types'

export interface AnalyticsKpiRowProps {
  summary: AnalyticsSummary
}

export interface Kpi {
  key: string
  labelKey:
    | 'analyticsRevenue'
    | 'analyticsAppointments'
    | 'analyticsNewClients'
    | 'analyticsAverageCheck'
    | 'analyticsLoad'
    | 'analyticsCancelRate'
  icon: IconName
  metric: AnalyticsMetric
  value: string
  /** Рост отмен — плохая новость, поэтому стрелка вверх здесь красная. */
  growthIsGood: boolean
}
