import { analyticsPeriods, type AnalyticsPeriod } from '@/modules/analytics/types'
import { computeAnalytics } from '../computeAnalytics'
import { ok, route } from '../router'

const DEFAULT_PERIOD: AnalyticsPeriod = 30

function readPeriod(value: string | undefined): AnalyticsPeriod {
  const period = Number(value)
  return analyticsPeriods.find((item) => item === period) ?? DEFAULT_PERIOD
}

export const analyticsRoutes = [
  route('get', '/api/analytics/summary/', ({ query }) =>
    ok(computeAnalytics(readPeriod(query.period))),
  ),
]
