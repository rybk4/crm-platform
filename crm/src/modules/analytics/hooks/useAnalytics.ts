import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

import { analyticsKeys } from '../api/analyticsKeys'
import { analyticsApi } from '../api/analyticsApi'
import type { AnalyticsPeriod } from '../types'

const DEFAULT_PERIOD: AnalyticsPeriod = 30

/** Свод показателей за выбранный период. */
export function useAnalytics(initialPeriod: AnalyticsPeriod = DEFAULT_PERIOD) {
  const [period, setPeriod] = useState<AnalyticsPeriod>(initialPeriod)

  const query = useQuery({
    queryKey: analyticsKeys.summary(period),
    queryFn: ({ signal }) => analyticsApi.summary(period, { signal }),
  })

  return {
    period,
    setPeriod,
    summary: query.data,
    isLoading: query.isPending,
  }
}
