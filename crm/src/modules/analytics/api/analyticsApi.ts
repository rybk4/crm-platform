import { ApiClient } from '@/lib/api/ApiClient'
import type { AnalyticsPeriod, AnalyticsSummary } from '../types'

class AnalyticsApi extends ApiClient {
  constructor() {
    super('/api/analytics/')
  }

  summary(period: AnalyticsPeriod, options?: { signal?: AbortSignal }) {
    return this.get<AnalyticsSummary>('summary/', { ...options, params: { period } })
  }
}

export const analyticsApi = new AnalyticsApi()
