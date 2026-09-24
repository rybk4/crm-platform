import { formatCompactMoney } from '@/lib/format/money'
import { formatPercent } from '@/lib/format/number'
import { useLocale } from '@/lib/i18n/LocaleContext'
import type { IconName } from '@/ui/Icon'
import { StatTile } from '@/ui/StatTile'
import { deltaLabelKey, metricDelta } from '../model'
import type { AnalyticsMetric, AnalyticsSummary } from '../types'

interface AnalyticsKpiRowProps {
  summary: AnalyticsSummary
}

interface Kpi {
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

export function AnalyticsKpiRow({ summary }: AnalyticsKpiRowProps) {
  const { t } = useLocale()
  const money = (value: number) => formatCompactMoney(value, summary.currency)

  const items: Kpi[] = [
    {
      key: 'revenue',
      labelKey: 'analyticsRevenue',
      icon: 'wallet',
      metric: summary.revenue,
      value: money(summary.revenue.value),
      growthIsGood: true,
    },
    {
      key: 'appointments',
      labelKey: 'analyticsAppointments',
      icon: 'journal',
      metric: summary.appointments,
      value: String(summary.appointments.value),
      growthIsGood: true,
    },
    {
      key: 'clients',
      labelKey: 'analyticsNewClients',
      icon: 'clients',
      metric: summary.new_clients,
      value: String(summary.new_clients.value),
      growthIsGood: true,
    },
    {
      key: 'check',
      labelKey: 'analyticsAverageCheck',
      icon: 'star',
      metric: summary.average_check,
      value: money(summary.average_check.value),
      growthIsGood: true,
    },
    {
      key: 'load',
      labelKey: 'analyticsLoad',
      icon: 'analytics',
      metric: summary.load_percent,
      value: formatPercent(summary.load_percent.value),
      growthIsGood: true,
    },
    {
      key: 'cancel',
      labelKey: 'analyticsCancelRate',
      icon: 'ban',
      metric: summary.cancel_rate,
      value: formatPercent(summary.cancel_rate.value),
      growthIsGood: false,
    },
  ]

  return (
    <div className="analytics-kpi">
      {items.map((item) => {
        const delta = metricDelta(item.metric)

        return (
          <StatTile
            key={item.key}
            label={t(item.labelKey)}
            value={item.value}
            icon={item.icon}
            direction={delta.direction}
            deltaGood={item.growthIsGood}
            deltaLabel={t(deltaLabelKey(delta), { value: delta.percent })}
            hint={t('analyticsVsPrevious')}
          />
        )
      })}
    </div>
  )
}
