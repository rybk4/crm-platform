import { formatShortDate } from '@/lib/format/datetime'
import { formatMoney } from '@/lib/format/money'
import { formatCompactNumber } from '@/lib/format/number'
import { useLocale } from '@/lib/i18n/LocaleContext'
import type { AnalyticsPoint } from '@/modules/analytics/types'
import { Card } from '@/ui/Card'
import { TrendChart } from '@/ui/charts/TrendChart'

interface WeekRevenueCardProps {
  points: readonly AnalyticsPoint[]
  currency: string
}

export function WeekRevenueCard({ points, currency }: WeekRevenueCardProps) {
  const { locale, t } = useLocale()

  return (
    <Card
      className="overview-card overview-card--chart"
      title={t('overviewRevenueWeek')}
      hint={t('overviewRevenueWeekHint')}
    >
      <TrendChart
        height={200}
        ariaLabel={t('overviewRevenueWeek')}
        points={points.map((point) => ({
          label: formatShortDate(point.date, locale),
          value: point.value,
        }))}
        formatValue={(value) => formatMoney(value, currency)}
        formatAxisValue={(value) => formatCompactNumber(value)}
      />
    </Card>
  )
}
