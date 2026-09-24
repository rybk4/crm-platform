import { formatDecimal, formatPercent } from '@/lib/format/number'
import { useLocale } from '@/lib/i18n/LocaleContext'
import { Card } from '@/ui/Card'
import { BarList } from '@/ui/charts/BarList'
import type { SpecialistDayLoad } from '../model'

interface TodayLoadCardProps {
  items: readonly SpecialistDayLoad[]
}

export function TodayLoadCard({ items }: TodayLoadCardProps) {
  const { t } = useLocale()

  return (
    <Card
      className="overview-card"
      title={t('overviewTodayLoad')}
      hint={t('overviewTodayLoadHint')}
    >
      {items.length ? (
        <BarList
          ariaLabel={t('overviewTodayLoad')}
          items={items.map((item) => ({
            id: String(item.id),
            label: item.name,
            value: item.percent,
            valueLabel: formatPercent(item.percent),
            hint: t('analyticsHoursShort', { count: formatDecimal(item.bookedMinutes / 60) }),
          }))}
        />
      ) : (
        <p className="overview-empty">{t('overviewNobodyWorks')}</p>
      )}
    </Card>
  )
}
