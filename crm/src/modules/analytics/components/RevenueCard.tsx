import { useState } from 'react'

import { formatShortDate } from '@/lib/format/datetime'
import { formatMoney } from '@/lib/format/money'
import { formatCompactNumber } from '@/lib/format/number'
import { useLocale } from '@/lib/i18n/LocaleContext'
import { Button } from '@/ui/Button'
import { Card } from '@/ui/Card'
import { TrendChart } from '@/ui/charts/TrendChart'
import type { AnalyticsPoint } from '../types'

interface RevenueCardProps {
  points: readonly AnalyticsPoint[]
  currency: string
}

export function RevenueCard({ points, currency }: RevenueCardProps) {
  const { locale, t } = useLocale()
  const [showTable, setShowTable] = useState(false)

  const series = points.map((point) => ({
    label: formatShortDate(point.date, locale),
    value: point.value,
  }))

  return (
    <Card
      className="analytics-card analytics-card--wide"
      title={t('analyticsRevenueTrend')}
      hint={t('analyticsRevenueTrendHint')}
      actions={
        <Button kind="quiet" onClick={() => setShowTable((value) => !value)}>
          {showTable ? t('analyticsHideTable') : t('analyticsShowTable')}
        </Button>
      }
    >
      <TrendChart
        points={series}
        ariaLabel={t('analyticsRevenueTrend')}
        formatValue={(value) => formatMoney(value, currency)}
        formatAxisValue={(value) => formatCompactNumber(value)}
      />

      {showTable ? (
        <table className="analytics-table">
          <thead>
            <tr>
              <th scope="col">{t('analyticsTableDay')}</th>
              <th scope="col">{t('analyticsTableValue')}</th>
            </tr>
          </thead>
          <tbody>
            {points.map((point) => (
              <tr key={point.date}>
                <td>{formatShortDate(point.date, locale)}</td>
                <td>{formatMoney(point.value, currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </Card>
  )
}
