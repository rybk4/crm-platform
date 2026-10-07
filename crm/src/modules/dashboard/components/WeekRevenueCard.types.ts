import type { AnalyticsPoint } from '@/modules/analytics/types'

export interface WeekRevenueCardProps {
  points: readonly AnalyticsPoint[]
  currency: string
}
