import { formatMoney } from '@/lib/format/money'
import { formatPercent } from '@/lib/format/number'
import { useLocale } from '@/lib/i18n/LocaleContext'
import { Card } from '@/ui/Card'
import { BarList } from '@/ui/charts/BarList'
import type { SpecialistLoadItem } from '../types'

interface SpecialistLoadCardProps {
  items: readonly SpecialistLoadItem[]
  currency: string
}

export function SpecialistLoadCard({ items, currency }: SpecialistLoadCardProps) {
  const { t } = useLocale()

  return (
    <Card
      className="analytics-card"
      title={t('analyticsSpecialistLoad')}
      hint={t('analyticsSpecialistLoadHint')}
    >
      <BarList
        ariaLabel={t('analyticsSpecialistLoad')}
        items={items.map((item) => ({
          id: String(item.specialist_id),
          label: item.specialist_name,
          value: item.load_percent,
          valueLabel: formatPercent(item.load_percent),
          hint: `${t('analyticsHoursShort', { count: Math.round(item.booked_minutes / 60) })} · ${formatMoney(item.revenue, currency)}`,
        }))}
      />
    </Card>
  )
}
