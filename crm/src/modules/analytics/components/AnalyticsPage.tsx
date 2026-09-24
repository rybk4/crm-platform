import { useLocale } from '@/lib/i18n/LocaleContext'
import { EmptyState } from '@/ui/EmptyState'
import { Loader } from '@/ui/Loader'
import { PageHeader } from '@/ui/PageHeader'
import { SegmentedControl } from '@/ui/SegmentedControl'
import { useAnalytics } from '../hooks/useAnalytics'
import { hasAnalyticsData, periodLabelKeys } from '../model'
import { analyticsPeriods, type AnalyticsPeriod } from '../types'
import { AnalyticsKpiRow } from './AnalyticsKpiRow'
import { RevenueCard } from './RevenueCard'
import { SpecialistLoadCard } from './SpecialistLoadCard'
import { StatusMixCard } from './StatusMixCard'
import { TopServicesCard } from './TopServicesCard'
import './analytics.css'

export function AnalyticsPage() {
  const { t } = useLocale()
  const analytics = useAnalytics()
  const summary = analytics.summary

  return (
    <section className="analytics-page">
      <PageHeader
        title={t('analyticsTitle')}
        description={t('analyticsDescription')}
        actions={
          <SegmentedControl
            ariaLabel={t('analyticsPeriod')}
            value={String(analytics.period)}
            options={analyticsPeriods.map((period) => ({
              value: String(period),
              label: t(periodLabelKeys[period]),
            }))}
            onChange={(value) => analytics.setPeriod(Number(value) as AnalyticsPeriod)}
          />
        }
      />

      {analytics.isLoading ? <Loader label={t('loading')} /> : null}

      {!analytics.isLoading && !hasAnalyticsData(summary) ? (
        <EmptyState
          icon="analytics"
          title={t('analyticsEmptyTitle')}
          description={t('analyticsNoData')}
        />
      ) : null}

      {summary && hasAnalyticsData(summary) ? (
        <>
          <AnalyticsKpiRow summary={summary} />

          <div className="analytics-grid">
            <RevenueCard points={summary.revenue_by_day} currency={summary.currency} />
            <SpecialistLoadCard items={summary.specialist_load} currency={summary.currency} />
            <StatusMixCard items={summary.status_breakdown} />
            <TopServicesCard items={summary.top_services} currency={summary.currency} />
          </div>
        </>
      ) : null}
    </section>
  )
}
