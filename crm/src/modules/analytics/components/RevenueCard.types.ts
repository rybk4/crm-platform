import type { AnalyticsPoint } from '../types'

export interface RevenueCardProps {
  points: readonly AnalyticsPoint[]
  currency: string
}
